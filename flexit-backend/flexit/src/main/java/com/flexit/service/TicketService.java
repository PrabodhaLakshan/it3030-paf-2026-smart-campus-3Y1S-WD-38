package com.flexit.service;

import com.flexit.exception.ResourceNotFoundException;
import com.flexit.model.*;
import com.flexit.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public IncidentTicket createTicket(IncidentTicket ticket) {
        if (ticket.getAttachmentUrls() != null && ticket.getAttachmentUrls().size() > 3) {
            throw new IllegalArgumentException("Maximum of 3 image attachments allowed.");
        }
        return ticketRepository.save(ticket);
    }

    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public IncidentTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    public IncidentTicket updateTicketStatus(String id, TicketStatus status, String notes, String techId, String userId) {
        IncidentTicket ticket = getTicketById(id);

        if (status == TicketStatus.REJECTED) {
            if (techId == null || techId.isBlank()) {
                throw new IllegalArgumentException("Technician id is required to reject a ticket.");
            }
            if (notes == null || notes.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket.");
            }
        }

        if (status == TicketStatus.RESOLVED) {
            if (userId == null || userId.isBlank()) {
                throw new IllegalArgumentException("User id is required to close a ticket.");
            }
            if (ticket.getReportedByUserId() == null || !ticket.getReportedByUserId().equals(userId)) {
                throw new IllegalArgumentException("Only the user who created the ticket can close it.");
            }
        }

        ticket.setStatus(status);
        
        if (techId != null) ticket.setAssignedTechnicianId(techId);
        if (status == TicketStatus.RESOLVED) ticket.setResolutionNotes(notes);
        if (status == TicketStatus.REJECTED) ticket.setRejectionReason(notes);
        
        return ticketRepository.save(ticket);
    }

    public IncidentTicket addComment(String ticketId, Comment comment) {
        IncidentTicket ticket = getTicketById(ticketId);
        ticket.getComments().add(comment);
        return ticketRepository.save(ticket);
    }

    public void deleteComment(String ticketId, String commentId, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);
        boolean removed = ticket.getComments().removeIf(c -> 
            c.getId().equals(commentId) && c.getUserId().equals(userId));
        
        if (!removed) throw new RuntimeException("Unauthorized to delete this comment");
        ticketRepository.save(ticket);
    }

    public IncidentTicket createTicketWithFiles(IncidentTicket ticket, List<MultipartFile> files) {
    // 1. Requirement: Max 3 images check
    if (files != null && files.size() > 3) {
        throw new IllegalArgumentException("You can only upload up to 3 images.");
    }

    // 2. Initial status setup
    ticket.setStatus(TicketStatus.OPEN);
    
    
    
    return ticketRepository.save(ticket);
}

// Requirement: Assign technician to ticket
public IncidentTicket assignTechnician(String ticketId, String techId) {
    IncidentTicket ticket = getTicketById(ticketId);
    ticket.setAssignedTechnicianId(techId);
    ticket.setStatus(TicketStatus.IN_PROGRESS); // Workflow transition
    return ticketRepository.save(ticket);
}
}