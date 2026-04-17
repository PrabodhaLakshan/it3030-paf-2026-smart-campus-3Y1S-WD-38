package com.flexit.controller;

import com.flexit.model.Comment;
import com.flexit.model.IncidentTicket;
import com.flexit.model.TicketStatus;
import com.flexit.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin(origins = "http://localhost:5173")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<IncidentTicket> createTicket(@Valid @RequestBody IncidentTicket ticket) {
        return new ResponseEntity<>(ticketService.createTicket(ticket), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentTicket> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody IncidentTicket ticket,
            @RequestParam String userId) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable String id, @RequestParam String userId) {
        ticketService.deleteTicket(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<IncidentTicket> createTicketWithFiles(
            @RequestPart("ticket") @Valid IncidentTicket ticket,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        return new ResponseEntity<>(ticketService.createTicketWithFiles(ticket, files), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<IncidentTicket>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus status,
            @RequestParam(required = false) String notes,
            @RequestParam(required = false) String techId,
            @RequestParam(required = false) String userId) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes, techId, userId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentTicket> addComment(@PathVariable String id, @RequestBody Comment comment) {
        return ResponseEntity.ok(ticketService.addComment(id, comment));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<IncidentTicket> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String userId,
            @RequestParam(required = false) String userRole,
            @RequestBody Comment comment) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, comment, userId, userRole));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String userId,
            @RequestParam(required = false) String userRole) {
        ticketService.deleteComment(ticketId, commentId, userId, userRole);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assignee")
    public ResponseEntity<IncidentTicket> assignTechnician(@PathVariable String id, @RequestParam String techId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, techId));
    }
}