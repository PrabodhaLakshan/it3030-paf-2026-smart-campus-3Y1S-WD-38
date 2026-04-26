package com.flexit.service;

import com.flexit.exception.ResourceNotFoundException;
import com.flexit.model.*;
import com.flexit.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Objects;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;
    private static final Map<String, String> DEFAULT_TECHNICIANS = Map.of(
            "TECH001", "Technician 001"
            
    );

    public TicketService(TicketRepository ticketRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    private int countWords(String text) {
        if (text == null) {
            return 0;
        }

        String normalized = text.trim();
        if (normalized.isBlank()) {
            return 0;
        }

        return normalized.split("\\s+").length;
    }

    private String normalizeText(String text) {
        return text == null ? "" : text.trim();
    }

    private String buildTicketTitle(IncidentTicket ticket) {
        String assetFacility = normalizeText(ticket.getAssetFacility());
        String category = normalizeText(ticket.getCategory());

        if (!assetFacility.isBlank() && !category.isBlank()) {
            return assetFacility + " - " + category;
        }

        if (!assetFacility.isBlank()) {
            return assetFacility;
        }

        if (!category.isBlank()) {
            return category;
        }

        return "Incident Ticket";
    }

    private void prepareTicketForSave(IncidentTicket ticket) {
        if (ticket.getAttachmentUrls() == null) {
            ticket.setAttachmentUrls(new ArrayList<>());
        }

        String generatedTitle = buildTicketTitle(ticket);
        if (ticket.getTitle() == null || ticket.getTitle().trim().isBlank()) {
            ticket.setTitle(generatedTitle);
        }
    }
    //convert to images to base64 and add to attachment urls list in ticket
    private void applyMultipartAttachments(IncidentTicket ticket, List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return;
        }

        List<String> attachments = ticket.getAttachmentUrls() == null ? new ArrayList<>() : new ArrayList<>(ticket.getAttachmentUrls());

        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }

            try {
                String mimeType = file.getContentType() == null ? "image/png" : file.getContentType();
                String encoded = Base64.getEncoder().encodeToString(file.getBytes());//convert file to base64 string
                attachments.add("data:" + mimeType + ";base64," + encoded);//store as data url format
            } catch (Exception exception) {
                throw new IllegalArgumentException("Unable to read uploaded image files.");
            }
        }

        if (attachments.size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed.");
        }

        ticket.setAttachmentUrls(attachments);
    }

    public IncidentTicket createTicket(IncidentTicket ticket) {
        prepareTicketForSave(ticket);
        if (ticket.getAttachmentUrls() != null && ticket.getAttachmentUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed.");
        }
        IncidentTicket savedTicket = ticketRepository.save(ticket);
        notificationService.createTicketCreatedForAdmins(savedTicket);
        return savedTicket;
    }

    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public List<TechnicianOption> getAvailableTechnicians() {
        Map<String, String> technicians = new LinkedHashMap<>(DEFAULT_TECHNICIANS);

        ticketRepository.findAll().forEach(ticket -> {
            String techId = ticket.getAssignedTechnicianId() == null ? "" : ticket.getAssignedTechnicianId().trim();
            if (techId.isBlank()) {
                return;
            }

            String techName = ticket.getAssignedTechnicianName() == null ? "" : ticket.getAssignedTechnicianName().trim();
            technicians.put(techId, techName.isBlank() ? technicians.getOrDefault(techId, techId) : techName);
        });

        return technicians.entrySet().stream()
                .map(entry -> new TechnicianOption(entry.getKey(), entry.getValue()))
                .toList();
    }

    public IncidentTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public IncidentTicket updateTicketStatus(String id, TicketStatus status, String notes, String techId, String userId) {
        IncidentTicket ticket = getTicketById(id);

        String normalizedTechId = techId == null ? "" : techId.trim();
        String normalizedUserId = userId == null ? "" : userId.trim();
        int noteWordCount = countWords(notes);

        if (status == TicketStatus.REJECTED) {
            if (normalizedTechId.isBlank()) {
                throw new IllegalArgumentException("Technician id is required to reject a ticket.");
            }
            if (noteWordCount < 5) {
                throw new IllegalArgumentException("Rejection reason must contain at least 5 words.");
            }
        }

        if (status == TicketStatus.RESOLVED) {
            if (noteWordCount < 5) {
                throw new IllegalArgumentException("Resolution reason must contain at least 5 words.");
            }

            // Technician can resolve only tickets assigned to them.
            if (!normalizedTechId.isBlank()) {
                if (ticket.getAssignedTechnicianId() == null || !ticket.getAssignedTechnicianId().equals(normalizedTechId)) {
                    throw new IllegalArgumentException("Only the assigned technician can resolve this ticket.");
                }
            } else {
                // Fallback: reporter can still close using user id when technician id is not supplied.
                if (normalizedUserId.isBlank()) {
                    throw new IllegalArgumentException("Technician id or user id is required to close a ticket.");
                }
                if (ticket.getReportedByUserId() == null || !ticket.getReportedByUserId().equals(normalizedUserId)) {
                    throw new IllegalArgumentException("Only the assigned technician or ticket creator can close this ticket.");
                }
            }
        }

        ticket.setStatus(status);
        
        if (!normalizedTechId.isBlank()) ticket.setAssignedTechnicianId(normalizedTechId);
        if (status == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
            ticket.setResolvedAt(java.time.LocalDateTime.now());
        } else {
            ticket.setResolvedAt(null);
        }
        if (status == TicketStatus.REJECTED) ticket.setRejectionReason(notes);

        // Rejected tickets are removed; resolved tickets remain for admin visibility and reporting.
        if (status == TicketStatus.REJECTED) {
            ticketRepository.delete(ticket);
            return ticket;
        }

        return ticketRepository.save(ticket);
    }

    public IncidentTicket addComment(String ticketId, Comment comment) {
        IncidentTicket ticket = getTicketById(ticketId);
        if (ticket.getComments() == null) {
            ticket.setComments(new ArrayList<>());
        }
        if (comment.getRole() == null || comment.getRole().trim().isBlank()) {
            comment.setRole("USER");
        } else {
            comment.setRole(comment.getRole().trim().toUpperCase());
        }
        ticket.getComments().add(comment);
        return ticketRepository.save(ticket);
    }

    public IncidentTicket updateComment(String ticketId, String commentId, Comment updatedComment, String userId, String userRole) {
        IncidentTicket ticket = getTicketById(ticketId);
        String normalizedUserId = normalizeText(userId);
        String normalizedUserRole = normalizeText(userRole).toUpperCase();

        if (normalizedUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required to edit a comment.");
        }

        if (normalizedUserRole.isBlank()) {
            throw new IllegalArgumentException("User role is required to edit a comment.");
        }

        Comment existingComment = ticket.getComments().stream()
                .filter(comment -> Objects.equals(comment.getId(), commentId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + commentId));

        if (!Objects.equals(existingComment.getUserId(), normalizedUserId)) {
            throw new IllegalArgumentException("Only the comment owner can edit this comment.");
        }

        if (existingComment.getRole() != null && !existingComment.getRole().trim().isBlank()) {
            String existingRole = existingComment.getRole().trim().toUpperCase();

            if (normalizedUserRole.isBlank() || !Objects.equals(existingRole, normalizedUserRole)) {
                throw new IllegalArgumentException("You cannot edit comments from a different role.");
            }

            existingComment.setRole(existingRole);
        } else {
            throw new IllegalArgumentException("Comment role is missing. Cannot edit this comment.");
        }

        existingComment.setText(normalizeText(updatedComment.getText()));
        if (updatedComment.getUserName() != null && !updatedComment.getUserName().trim().isBlank()) {
            existingComment.setUserName(updatedComment.getUserName().trim());
        }

        return ticketRepository.save(ticket);
    }

    public IncidentTicket updateTicket(String ticketId, IncidentTicket updatedTicket, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);
        String normalizedUserId = userId == null ? "" : userId.trim();

        if (normalizedUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required to update a ticket.");
        }

        if (ticket.getReportedByUserId() == null || !ticket.getReportedByUserId().equals(normalizedUserId)) {
            throw new IllegalArgumentException("Only the ticket creator can edit this ticket.");
        }

        if (ticket.getStatus() == TicketStatus.IN_PROGRESS || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Tickets can only be edited while open or rejected.");
        }

        if (updatedTicket.getAttachmentUrls() != null && updatedTicket.getAttachmentUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed.");
        }

        ticket.setAssetFacility(updatedTicket.getAssetFacility());
        ticket.setLocation(updatedTicket.getLocation());
        ticket.setCategory(updatedTicket.getCategory());
        ticket.setTitle(updatedTicket.getTitle());
        ticket.setDescription(updatedTicket.getDescription());
        ticket.setPriority(updatedTicket.getPriority());
        ticket.setAttachmentUrls(updatedTicket.getAttachmentUrls());
        ticket.setReportedByUserName(updatedTicket.getReportedByUserName());
        ticket.setReportedByUserId(normalizedUserId);
        ticket.setResolutionNotes(null);
        ticket.setRejectionReason(null);

        if (ticket.getStatus() == TicketStatus.REJECTED) {
            ticket.setStatus(TicketStatus.OPEN);
        }

        return ticketRepository.save(ticket);
    }

    public void deleteTicket(String ticketId, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);
        String normalizedUserId = userId == null ? "" : userId.trim();

        if (normalizedUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required to delete a ticket.");
        }

        if (ticket.getReportedByUserId() == null || !ticket.getReportedByUserId().equals(normalizedUserId)) {
            throw new IllegalArgumentException("Only the ticket creator can delete this ticket.");
        }

        if (ticket.getStatus() == TicketStatus.IN_PROGRESS || ticket.getStatus() == TicketStatus.RESOLVED) {
            throw new IllegalArgumentException("Tickets can only be deleted while open or rejected.");
        }

        ticketRepository.delete(ticket);
    }


    public void deleteComment(String ticketId, String commentId, String userId, String userRole) {
        IncidentTicket ticket = getTicketById(ticketId);
        String normalizedUserRole = userRole == null ? "" : userRole.trim().toUpperCase();

        if (normalizedUserRole.isBlank()) {
            throw new IllegalArgumentException("User role is required to delete a comment.");
        }

        boolean removed = ticket.getComments().removeIf(c ->
            Objects.equals(c.getId(), commentId) &&
            Objects.equals(c.getUserId(), userId) &&
            c.getRole() != null &&
            !c.getRole().trim().isBlank() &&
            Objects.equals(c.getRole().trim().toUpperCase(), normalizedUserRole));
        
        if (!removed) throw new RuntimeException("Unauthorized to delete this comment");
        ticketRepository.save(ticket);
    }
    public IncidentTicket createTicketWithFiles(IncidentTicket ticket, List<MultipartFile> files) {
        // 1. Requirement: Max 3 images check
        if (files != null && files.size() > 3) {
            throw new IllegalArgumentException("You can only upload up to 3 images.");
        }

        // 2. Initial status setup and title generation
        ticket.setStatus(TicketStatus.OPEN);
        prepareTicketForSave(ticket);
        applyMultipartAttachments(ticket, files);

        IncidentTicket savedTicket = ticketRepository.save(ticket);
        notificationService.createTicketCreatedForAdmins(savedTicket);
        return savedTicket;
    }

// Requirement: Assign technician to ticket
public IncidentTicket assignTechnician(String ticketId, String techId) {
    IncidentTicket ticket = getTicketById(ticketId);
    ticket.setAssignedTechnicianId(techId);
    ticket.setAssignedAt(java.time.LocalDateTime.now());
    ticket.setStatus(TicketStatus.IN_PROGRESS); // Workflow transition
    return ticketRepository.save(ticket);
}
}