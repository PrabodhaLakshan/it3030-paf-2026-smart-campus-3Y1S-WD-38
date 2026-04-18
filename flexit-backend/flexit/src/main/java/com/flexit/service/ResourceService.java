package com.flexit.service;

import com.flexit.exception.ResourceNotFoundException;
import com.flexit.model.Resource;
import com.flexit.model.ResourceStatus;
import com.flexit.model.ResourceType;
import com.flexit.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.util.*;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public Resource createResource(Resource resource) {
        resource.setResourceCode(generateResourceCode(resource.getType()));
        return resourceRepository.save(resource);
    }

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(String id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
    }

    public Resource updateResource(String id, Resource updatedResource) {
        Resource existing = getResourceById(id);

        if (existing.getType() != updatedResource.getType()) {
            existing.setResourceCode(generateResourceCode(updatedResource.getType()));
        }

        existing.setName(updatedResource.getName());
        existing.setType(updatedResource.getType());
        existing.setCapacity(updatedResource.getCapacity());
        existing.setLocation(updatedResource.getLocation());
        existing.setAvailabilityStart(updatedResource.getAvailabilityStart());
        existing.setAvailabilityEnd(updatedResource.getAvailabilityEnd());
        existing.setStatus(updatedResource.getStatus());
        existing.setDescription(updatedResource.getDescription());

        return resourceRepository.save(existing);
    }

    public void deleteResource(String id) {
        Resource existing = getResourceById(id);
        resourceRepository.delete(existing);
    }

    public List<Resource> searchResources(String type, Integer capacity, String location) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(resource -> type == null || resource.getType().name().equalsIgnoreCase(type))
                .filter(resource -> capacity == null || resource.getCapacity() >= capacity)
                .filter(resource -> location == null
                        || resource.getLocation().toLowerCase().contains(location.toLowerCase()))
                .toList();
    }

    // ─── CSV Export ────────────────────────────────────────────────────────────

    public void exportToCsv(PrintWriter writer) {
        List<Resource> resources = resourceRepository.findAll();

        // Header row
        writer.println("resourceCode,name,type,capacity,location,availabilityStart,availabilityEnd,status,description");

        for (Resource r : resources) {
            writer.printf("\"%s\",\"%s\",\"%s\",%d,\"%s\",\"%s\",\"%s\",\"%s\",\"%s\"%n",
                    safe(r.getResourceCode()),
                    safe(r.getName()),
                    r.getType() != null ? r.getType().name() : "",
                    r.getCapacity() != null ? r.getCapacity() : 0,
                    safe(r.getLocation()),
                    safe(r.getAvailabilityStart()),
                    safe(r.getAvailabilityEnd()),
                    r.getStatus() != null ? r.getStatus().name() : "",
                    safe(r.getDescription())
            );
        }
        writer.flush();
    }

    // ─── CSV Import ────────────────────────────────────────────────────────────

    public Map<String, Object> importFromCsv(MultipartFile file) {
        List<Map<String, Object>> errors = new ArrayList<>();
        int imported = 0;
        int rowNum = 1; // 1 = header

        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream()))) {

            String headerLine = reader.readLine();
            if (headerLine == null) {
                return Map.of("message", "CSV file is empty.", "imported", 0, "errors", errors);
            }

            String line;
            while ((line = reader.readLine()) != null) {
                rowNum++;
                line = line.trim();
                if (line.isEmpty()) continue;

                String[] cols = parseCsvLine(line);

                // Expect at minimum: name, type, capacity, location, availabilityStart, availabilityEnd, status
                if (cols.length < 7) {
                    errors.add(rowError(rowNum, "Row has too few columns (expected at least 7)."));
                    continue;
                }

                try {
                    Resource resource = new Resource();
                    resource.setName(requireNonEmpty(cols, 0, "name"));
                    resource.setType(parseEnum(ResourceType.class, cols, 1, "type",
                            Arrays.stream(ResourceType.values()).map(Enum::name).toList()));
                    resource.setCapacity(parseCapacity(cols, 2));
                    resource.setLocation(requireNonEmpty(cols, 3, "location"));
                    resource.setAvailabilityStart(requireNonEmpty(cols, 4, "availabilityStart"));
                    resource.setAvailabilityEnd(requireNonEmpty(cols, 5, "availabilityEnd"));
                    resource.setStatus(parseEnum(ResourceStatus.class, cols, 6, "status",
                            Arrays.stream(ResourceStatus.values()).map(Enum::name).toList()));
                    resource.setDescription(cols.length > 7 ? cols[7].trim() : "");

                    resource.setResourceCode(generateResourceCode(resource.getType()));
                    resourceRepository.save(resource);
                    imported++;

                } catch (IllegalArgumentException e) {
                    errors.add(rowError(rowNum, e.getMessage()));
                }
            }

        } catch (IOException e) {
            return Map.of("message", "Failed to read CSV file: " + e.getMessage(),
                    "imported", imported, "errors", errors);
        }

        String summary = imported > 0
                ? String.format("Successfully imported %d resource(s).", imported)
                : "No resources were imported.";
        if (!errors.isEmpty()) {
            summary += String.format(" %d row(s) had errors and were skipped.", errors.size());
        }

        return Map.of("message", summary, "imported", imported, "errors", errors);
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────

    private String safe(String s) {
        return s != null ? s.replace("\"", "\"\"") : "";
    }

    private Map<String, Object> rowError(int row, String message) {
        Map<String, Object> err = new HashMap<>();
        err.put("row", row);
        err.put("message", message);
        return err;
    }

    private String requireNonEmpty(String[] cols, int idx, String fieldName) {
        String val = cols[idx].trim();
        if (val.isEmpty()) {
            throw new IllegalArgumentException(
                    "Field '" + fieldName + "' is required and cannot be empty.");
        }
        return val;
    }

    private <T extends Enum<T>> T parseEnum(Class<T> clazz, String[] cols, int idx,
                                             String fieldName, List<String> valid) {
        String val = cols[idx].trim().toUpperCase();
        try {
            return Enum.valueOf(clazz, val);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException(
                    "Invalid value '" + cols[idx].trim() + "' for field '" + fieldName +
                    "'. Must be one of: " + String.join(", ", valid));
        }
    }

    private int parseCapacity(String[] cols, int idx) {
        String val = cols[idx].trim();
        try {
            int cap = Integer.parseInt(val);
            if (cap < 1) {
                throw new IllegalArgumentException("Capacity must be at least 1.");
            }
            return cap;
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(
                    "Invalid capacity value '" + val + "'. Must be a positive integer.");
        }
    }

    /**
     * Simple CSV line parser that handles quoted fields (supporting commas inside quotes).
     */
    private String[] parseCsvLine(String line) {
        List<String> result = new ArrayList<>();
        boolean inQuotes = false;
        StringBuilder current = new StringBuilder();

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    current.append('"');
                    i++; // skip next quote
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                result.add(current.toString());
                current.setLength(0);
            } else {
                current.append(c);
            }
        }
        result.add(current.toString());
        return result.toArray(new String[0]);
    }

    private String generateResourceCode(ResourceType type) {
        String prefix = getPrefix(type);
        int count = resourceRepository.findByType(type).size();
        return String.format("%s-%03d", prefix, count + 1);
    }

    private String getPrefix(ResourceType type) {
        return switch (type) {
            case LECTURE_HALL -> "LH";
            case LAB -> "LAB";
            case MEETING_ROOM -> "MR";
            case PROJECTOR -> "PR";
            case CAMERA -> "CAM";
        };
    }
}