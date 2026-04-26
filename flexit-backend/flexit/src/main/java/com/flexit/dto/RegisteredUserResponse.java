package com.flexit.dto;

import java.time.LocalDateTime;

public class RegisteredUserResponse {

    private String id;
    private String userCode;
    private String fullName;
    private String email;
    private String role;
    private boolean active;
    private LocalDateTime bannedUntil;
    private boolean online;
    private LocalDateTime lastSeenAt;
    private LocalDateTime createdAt;

    public RegisteredUserResponse() {
    }

    public RegisteredUserResponse(String id,
                                  String userCode,
                                  String fullName,
                                  String email,
                                  String role,
                                  boolean active,
                                  LocalDateTime bannedUntil,
                                  boolean online,
                                  LocalDateTime lastSeenAt,
                                  LocalDateTime createdAt) {
        this.id = id;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.active = active;
        this.bannedUntil = bannedUntil;
        this.online = online;
        this.lastSeenAt = lastSeenAt;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserCode() {
        return userCode;
    }

    public void setUserCode(String userCode) {
        this.userCode = userCode;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getBannedUntil() {
        return bannedUntil;
    }

    public void setBannedUntil(LocalDateTime bannedUntil) {
        this.bannedUntil = bannedUntil;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }

    public LocalDateTime getLastSeenAt() {
        return lastSeenAt;
    }

    public void setLastSeenAt(LocalDateTime lastSeenAt) {
        this.lastSeenAt = lastSeenAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
