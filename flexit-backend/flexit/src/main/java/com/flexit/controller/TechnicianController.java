package com.flexit.controller;

import com.flexit.model.TechnicianOption;
import com.flexit.service.TicketService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin(origins = "http://localhost:5173")
public class TechnicianController {

    private final TicketService ticketService;

    public TechnicianController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<TechnicianOption>> getAvailableTechnicians() {
        return ResponseEntity.ok(ticketService.getAvailableTechnicians());
    }
}
