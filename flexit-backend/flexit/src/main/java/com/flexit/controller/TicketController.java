package com.flexit.controller;

import com.flexit.model.Comment;
import com.flexit.model.IncidentTicket;
import com.flexit.model.TicketStatus;
import com.flexit.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.concurrent.TimeUnit;

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
            @PathVariable("id") String id,
            @Valid @RequestBody IncidentTicket ticket,
            @RequestParam("userId") String userId) {
        return ResponseEntity.ok(ticketService.updateTicket(id, ticket, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable("id") String id, @RequestParam("userId") String userId) {
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
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate().mustRevalidate())
                .body(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentTicket> getTicketById(@PathVariable("id") String id) {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(30, TimeUnit.SECONDS).cachePrivate().mustRevalidate())
                .body(ticketService.getTicketById(id));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<IncidentTicket> updateStatus(
            @PathVariable("id") String id,
            @RequestParam("status") TicketStatus status,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "techId", required = false) String techId,
            @RequestParam(value = "userId", required = false) String userId) {
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, status, notes, techId, userId));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<IncidentTicket> addComment(@PathVariable("id") String id, @RequestBody Comment comment) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ticketService.addComment(id, comment));
    }

    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<IncidentTicket> updateComment(
            @PathVariable("ticketId") String ticketId,
            @PathVariable("commentId") String commentId,
            @RequestParam("userId") String userId,
            @RequestParam(value = "userRole", required = false) String userRole,
            @RequestBody Comment comment) {
        return ResponseEntity.ok(ticketService.updateComment(ticketId, commentId, comment, userId, userRole));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable("ticketId") String ticketId,
            @PathVariable("commentId") String commentId,
            @RequestParam("userId") String userId,
            @RequestParam(value = "userRole", required = false) String userRole) {
        ticketService.deleteComment(ticketId, commentId, userId, userRole);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assignee")
    public ResponseEntity<IncidentTicket> assignTechnician(@PathVariable("id") String id, @RequestParam("techId") String techId) {
        return ResponseEntity.ok(ticketService.assignTechnician(id, techId));
    }
}