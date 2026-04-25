package com.flexit.service;

import com.flexit.model.Booking;
import com.flexit.model.Notification;
import com.flexit.model.NotificationType;
import com.flexit.model.UserRole;
import com.flexit.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public Notification createForUser(String userId,
                                      NotificationType type,
                                      String title,
                                      String message,
                                      String actionUrl) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        Notification notification = new Notification();
        notification.setRecipientUserId(userId.trim());
        notification.setRecipientRole(null);
        notification.setType(type == null ? NotificationType.GENERAL : type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public Notification createForRole(UserRole role,
                                      NotificationType type,
                                      String title,
                                      String message,
                                      String actionUrl) {
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }

        Notification notification = new Notification();
        notification.setRecipientUserId(null);
        notification.setRecipientRole(role);
        notification.setType(type == null ? NotificationType.GENERAL : type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public void createBookingCreatedForAdmins(Booking booking) {
        String title = "New booking request received";
        String message = String.format(
                Locale.ENGLISH,
                "%s submitted a booking for %s.",
                safeValue(booking.getUserId()),
                safeValue(booking.getResourceId())
        );

        createForRole(UserRole.ADMIN, NotificationType.BOOKING_CREATED, title, message, "/admin/bookings");
    }

    public void createBookingApprovedForUser(Booking booking) {
        String userId = normalize(booking.getUserId());
        if (userId.isBlank()) {
            return;
        }

        String title = "Booking approved";
        String message = String.format(
                Locale.ENGLISH,
                "Your booking for %s was approved.",
                safeValue(booking.getResourceId())
        );

        createForUser(userId, NotificationType.BOOKING_APPROVED, title, message, "/my-bookings");
    }

    public void createBookingRejectedForUser(Booking booking) {
        String userId = normalize(booking.getUserId());
        if (userId.isBlank()) {
            return;
        }

        String title = "Booking rejected";
        String reason = normalize(booking.getRejectionReason());
        String message = reason.isBlank()
                ? String.format(
                        Locale.ENGLISH,
                        "Your booking for %s was rejected.",
                        safeValue(booking.getResourceId())
                )
                : String.format(
                        Locale.ENGLISH,
                        "Your booking for %s was rejected. Reason: %s",
                        safeValue(booking.getResourceId()),
                        reason
                );

        createForUser(userId, NotificationType.BOOKING_REJECTED, title, message, "/my-bookings");
    }

    public Notification createLoginNotification(String userId, String roleValue, String fullName) {
        String normalizedUserId = normalize(userId);
        if (normalizedUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        UserRole role = parseRole(roleValue);
        String userName = normalize(fullName);
        if (userName.isBlank()) {
            userName = "User";
        }

        String title = "Welcome back, " + userName + "!";
        String message;
        String actionUrl;

        if (role == UserRole.ADMIN) {
            message = "Admin dashboard is ready. Review resources and tickets from your workspace.";
            actionUrl = "/admin/dashboard";
        } else if (role == UserRole.TECHNICIAN) {
            message = "Technician dashboard is ready. Review assigned tickets.";
            actionUrl = "/technician/dashboard";
        } else {
            message = "You have successfully logged in to your FlexIT workspace.";
            actionUrl = "/user/dashboard";
        }

        return createForUser(normalizedUserId, NotificationType.LOGIN, title, message, actionUrl);
    }

    public List<Notification> getNotificationsForUser(String userId, String roleValue, Integer limit) {
        UserRole role = parseRole(roleValue);
        String normalizedUserId = normalize(userId);

        if (normalizedUserId.isBlank() && role == null) {
            return List.of();
        }

        List<Notification> merged = new ArrayList<>();

        if (!normalizedUserId.isBlank()) {
            merged.addAll(notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(normalizedUserId));
        }

        if (role != null) {
            merged.addAll(notificationRepository.findByRecipientRoleOrderByCreatedAtDesc(role));
        }

        Map<String, Notification> byId = new LinkedHashMap<>();
        merged.stream()
                .sorted(Comparator.comparing(Notification::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .forEach(item -> {
                    if (item.getId() != null && !byId.containsKey(item.getId())) {
                        byId.put(item.getId(), item);
                    }
                });

        int safeLimit = limit == null || limit <= 0 ? 100 : Math.min(limit, 200);
        return byId.values().stream().limit(safeLimit).toList();
    }

    public long getUnreadCountForUser(String userId, String roleValue) {
        UserRole role = parseRole(roleValue);
        String normalizedUserId = normalize(userId);

        long total = 0;

        if (!normalizedUserId.isBlank()) {
            total += notificationRepository.countByRecipientUserIdAndIsReadFalse(normalizedUserId);
        }

        if (role != null) {
            total += notificationRepository.countByRecipientRoleAndIsReadFalse(role);
        }

        return total;
    }

    public Notification markAsRead(String notificationId, String userId, String roleValue) {
        String normalizedNotificationId = normalize(notificationId);
        if (normalizedNotificationId.isBlank()) {
            throw new RuntimeException("Notification id is required");
        }

        Notification notification = notificationRepository.findById(normalizedNotificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!canAccess(notification, userId, roleValue)) {
            throw new RuntimeException("Not allowed to update this notification");
        }

        if (!notification.isRead()) {
            notification.setRead(true);
            notification = notificationRepository.save(notification);
        }

        return notification;
    }

    private boolean canAccess(Notification notification, String userId, String roleValue) {
        String normalizedUserId = normalize(userId);
        UserRole role = parseRole(roleValue);

        boolean userMatch = !normalizedUserId.isBlank()
                && normalize(notification.getRecipientUserId()).equals(normalizedUserId);

        boolean roleMatch = role != null && role == notification.getRecipientRole();

        return userMatch || roleMatch;
    }

    private UserRole parseRole(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return UserRole.valueOf(value.trim().toUpperCase(Locale.ENGLISH));
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String safeValue(String value) {
        String normalized = normalize(value);
        return normalized.isBlank() ? "Unknown user" : normalized;
    }
}
