package com.flexit.service;

import com.flexit.exception.ResourceNotFoundException;
import com.flexit.model.*;
import com.flexit.repository.TicketRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class TicketService {
    private final TicketRepository ticketRepository;

    public TicketService(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    public IncidentTicket createTicket(IncidentTicket ticket, List<String> attachments) {
        if (attachments != null && attachments.size() > 3) {
            throw new IllegalArgumentException("Maximum 3 image attachments allowed.");
        }
        ticket.setAttachmentUrls(attachments);
        return ticketRepository.save(ticket);
    }

    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public IncidentTicket getTicketById(String id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found: " + id));
    }

    // Admin/Technician: Update Status & Resolution
    public IncidentTicket updateTicketStatus(String id, TicketStatus newStatus, String notes, String technicianId) {
        IncidentTicket ticket = getTicketById(id);
        ticket.setStatus(newStatus);
        
        if (newStatus == TicketStatus.RESOLVED) {
            ticket.setResolutionNotes(notes);
        } else if (newStatus == TicketStatus.REJECTED) {
            ticket.setRejectionReason(notes);
        }
        
        if (technicianId != null) {
            ticket.setAssignedTechnicianId(technicianId);
        }
        
        return ticketRepository.save(ticket);
    }

    // Comment Management
    public IncidentTicket addComment(String ticketId, Comment comment) {
        IncidentTicket ticket = getTicketById(ticketId);
        ticket.getComments().add(comment);
        return ticketRepository.save(ticket);
    }

    public void deleteComment(String ticketId, String commentId, String userId) {
        IncidentTicket ticket = getTicketById(ticketId);
        // Ownership Check: Only the author can delete
        boolean removed = ticket.getComments().removeIf(c -> 
            c.getId().equals(commentId) && c.getUserId().equals(userId));
        
        if (!removed) {
            throw new RuntimeException("Unauthorized or comment not found");
        }
        ticketRepository.save(ticket);
    }
}