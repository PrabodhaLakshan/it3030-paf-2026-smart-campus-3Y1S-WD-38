package com.flexit.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "tickets")
public class IncidentTicket {

    @Id
    private String id;

    @NotBlank(message = "Title is required")
    private String title;

    private String assetFacility;
    private String location;
    private String category;

    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    private TicketStatus status = TicketStatus.OPEN;

    private String reportedByUserId;
    private String reportedByUserName;
    private LocalDateTime createdAt = LocalDateTime.now();

    private String assignedTechnicianId;
    private String assignedTechnicianName;
    private LocalDateTime assignedAt;
    private LocalDateTime resolvedAt;

    @Size(max = 3, message = "Maximum 3 images allowed")
    private List<String> attachmentUrls = new ArrayList<>();
    private List<Comment> comments = new ArrayList<>();

    private String resolutionNotes;
    private String rejectionReason;

    // Constructors
    public IncidentTicket() {}

    // Getters and Setters (generate these in your IDE or manually)
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAssetFacility() { return assetFacility; }
    public void setAssetFacility(String assetFacility) { this.assetFacility = assetFacility; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public String getReportedByUserId() { return reportedByUserId; }
    public void setReportedByUserId(String reportedByUserId) { this.reportedByUserId = reportedByUserId; }

    public String getReportedByUserName() { return reportedByUserName; }
    public void setReportedByUserName(String reportedByUserName) { this.reportedByUserName = reportedByUserName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getAssignedTechnicianId() { return assignedTechnicianId; }
    public void setAssignedTechnicianId(String assignedTechnicianId) { this.assignedTechnicianId = assignedTechnicianId; }

    public String getAssignedTechnicianName() { return assignedTechnicianName; }
    public void setAssignedTechnicianName(String assignedTechnicianName) { this.assignedTechnicianName = assignedTechnicianName; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }

    public List<String> getAttachmentUrls() { return attachmentUrls; }
    public void setAttachmentUrls(List<String> attachmentUrls) { this.attachmentUrls = attachmentUrls; }

    public List<Comment> getComments() { return comments; }
    public void setComments(List<Comment> comments) { this.comments = comments; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}