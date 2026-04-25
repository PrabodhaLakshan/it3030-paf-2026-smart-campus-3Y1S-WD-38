package com.flexit.controller;

import com.flexit.model.Notification;
import com.flexit.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/my")
    public ResponseEntity<List<Notification>> getMyNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer limit
    ) {
        return ResponseEntity.ok(notificationService.getNotificationsForUser(userId, role, limit));
    }

    @GetMapping("/my/unread-count")
    public ResponseEntity<Map<String, Long>> getMyUnreadCount(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        long count = notificationService.getUnreadCountForUser(userId, role);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable String id,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userId, role));
    }

    @PostMapping("/login")
    public ResponseEntity<Notification> createLoginNotification(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(
                notificationService.createLoginNotification(
                        request.get("userId"),
                        request.get("role"),
                        request.get("fullName")
                )
        );
    }
}
