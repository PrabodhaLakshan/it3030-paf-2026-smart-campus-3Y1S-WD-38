package com.flexit.repository;

import com.flexit.model.Notification;
import com.flexit.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(String recipientUserId);

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(UserRole recipientRole);

    long countByRecipientUserIdAndIsReadFalse(String recipientUserId);

    long countByRecipientRoleAndIsReadFalse(UserRole recipientRole);
}
