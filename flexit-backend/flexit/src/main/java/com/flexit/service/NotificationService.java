package com.flexit.service;

import com.flexit.dto.AdminNotificationCreateRequest;
import com.flexit.model.Booking;
import com.flexit.model.Notification;
import com.flexit.model.NotificationType;
import com.flexit.model.Resource;
import com.flexit.model.IncidentTicket;
import com.flexit.model.UserRole;
import com.flexit.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

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
        notification.setSubject(title);
        notification.setMessage(message);
        notification.setActionUrl(normalizeActionUrl(actionUrl));
        notification.setRead(false);
        notification.setSenderUserId("SYSTEM");
        notification.setSenderName("System");
        notification.setSenderRole(null);
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
        notification.setSubject(title);
        notification.setMessage(message);
        notification.setActionUrl(normalizeActionUrl(actionUrl));
        notification.setRead(false);
        notification.setSenderUserId("SYSTEM");
        notification.setSenderName("System");
        notification.setSenderRole(null);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
    }

    public List<Notification> createAdminBroadcast(AdminNotificationCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request is required");
        }

        String senderUserId = normalize(request.getSenderUserId());
        if (senderUserId.isBlank()) {
            throw new IllegalArgumentException("Sender user id is required");
        }

        UserRole senderRole = parseRole(request.getSenderRole());
        if (senderRole != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only admins can create broadcast notifications");
        }

        String title = normalize(request.getTitle());
        String subject = normalize(request.getSubject());
        String message = normalize(request.getMessage());

        if (title.isBlank()) {
            throw new IllegalArgumentException("Title is required");
        }

        if (subject.isBlank()) {
            subject = title;
        }

        if (message.isBlank()) {
            throw new IllegalArgumentException("Notification message is required");
        }

        String senderName = normalize(request.getSenderName());
        if (senderName.isBlank()) {
            senderName = "Admin";
        }

        String actionUrl = normalizeActionUrl(request.getActionUrl());

        Set<UserRole> recipientRoles = resolveRecipientRoles(request.getAudiences());
        if (recipientRoles.isEmpty()) {
            throw new IllegalArgumentException("At least one audience is required");
        }

        List<Notification> createdNotifications = new ArrayList<>();
        for (UserRole role : recipientRoles) {
            Notification notification = new Notification();
            notification.setRecipientUserId(null);
            notification.setRecipientRole(role);
            notification.setType(NotificationType.GENERAL);
            notification.setTitle(title);
            notification.setSubject(subject);
            notification.setMessage(message);
            notification.setActionUrl(actionUrl);
            notification.setRead(false);
            notification.setSenderUserId(senderUserId);
            notification.setSenderName(senderName);
            notification.setSenderRole(UserRole.ADMIN);
            notification.setCreatedAt(LocalDateTime.now());
            createdNotifications.add(notificationRepository.save(notification));
        }

        return createdNotifications;
    }

    public List<Notification> getSentNotificationsForUser(String senderUserId, Integer limit) {
        String normalizedSenderUserId = normalize(senderUserId);
        if (normalizedSenderUserId.isBlank()) {
            return List.of();
        }

        List<Notification> items = notificationRepository.findBySenderUserIdOrderByCreatedAtDesc(normalizedSenderUserId);
        int safeLimit = limit == null || limit <= 0 ? 100 : Math.min(limit, 300);
        return items.stream().limit(safeLimit).toList();
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

    public void createResourceCreatedForUsers(Resource resource) {
        if (resource == null) {
            return;
        }

        String title = "New resource available";
        String message = String.format(
                Locale.ENGLISH,
                "%s (%s) is now available for booking.",
                safeValue(resource.getName()),
                safeValue(resource.getResourceCode())
        );

        createForRole(UserRole.USER, NotificationType.GENERAL, title, message, "/user/resources");
    }

    public void createTicketCreatedForAdmins(IncidentTicket ticket) {
        if (ticket == null) {
            return;
        }

        String title = "New support ticket submitted";
        String message = String.format(
                Locale.ENGLISH,
                "%s submitted a new ticket: %s.",
                safeValue(ticket.getReportedByUserName()),
                safeValue(ticket.getTitle())
        );

        createForRole(UserRole.ADMIN, NotificationType.GENERAL, title, message, "/admin/tickets");
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

    public Notification createReactivationRequestNotification(String userId, String userCode, String fullName) {
        String normalizedUserId = normalize(userId);
        if (normalizedUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        String normalizedUserCode = normalize(userCode);
        String normalizedFullName = normalize(fullName);
        if (normalizedFullName.isBlank()) {
            normalizedFullName = "User";
        }

        String title = "Reactivation request";
        String message = String.format(
                Locale.ENGLISH,
                "%s (%s) requested account reactivation.",
                normalizedFullName,
                normalizedUserCode.isBlank() ? normalizedUserId : normalizedUserCode
        );

        Notification notification = new Notification();
        notification.setRecipientUserId(null);
        notification.setRecipientRole(UserRole.ADMIN);
        notification.setType(NotificationType.GENERAL);
        notification.setTitle(title);
        notification.setSubject(title);
        notification.setMessage(message);
        notification.setActionUrl(normalizeActionUrl("/admin/users"));
        notification.setRead(false);
        notification.setSenderUserId(normalizedUserId);
        notification.setSenderName(normalizedFullName);
        notification.setSenderRole(UserRole.USER);
        notification.setCreatedAt(LocalDateTime.now());
        return notificationRepository.save(notification);
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

    private Set<UserRole> resolveRecipientRoles(List<String> audiences) {
        if (audiences == null || audiences.isEmpty()) {
            return Set.of();
        }

        Set<UserRole> roles = new HashSet<>();

        for (String audience : audiences) {
            String normalizedAudience = normalize(audience).toUpperCase(Locale.ENGLISH);
            if (normalizedAudience.isBlank()) {
                continue;
            }

            if ("ALL".equals(normalizedAudience) || "TO_ALL".equals(normalizedAudience)) {
                roles.add(UserRole.USER);
                roles.add(UserRole.TECHNICIAN);
                roles.add(UserRole.ADMIN);
                continue;
            }

            if ("USERS".equals(normalizedAudience) || "TO_USERS".equals(normalizedAudience)) {
                roles.add(UserRole.USER);
                continue;
            }

            if ("TECHNICIANS".equals(normalizedAudience) || "TO_TECHNICIANS".equals(normalizedAudience)) {
                roles.add(UserRole.TECHNICIAN);
                continue;
            }

            if ("ADMINS".equals(normalizedAudience) || "TO_ADMINS".equals(normalizedAudience)) {
                roles.add(UserRole.ADMIN);
                continue;
            }

            UserRole parsed = parseRole(normalizedAudience);
            if (parsed != null) {
                roles.add(parsed);
            }
        }

        return roles;
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

    private String normalizeActionUrl(String value) {
        String normalized = normalize(value);
        if (normalized.isBlank()) {
            return "/admin/notifications";
        }

        String lower = normalized.toLowerCase(Locale.ENGLISH);
        if (lower.startsWith("http://") || lower.startsWith("https://")) {
            return normalized;
        }

        if (!normalized.startsWith("/")) {
            return "/" + normalized;
        }

        return normalized;
    }
}
