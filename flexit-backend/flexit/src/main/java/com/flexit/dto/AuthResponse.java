package com.flexit.dto;

import java.time.LocalDateTime;

public class AuthResponse {

    private String message;
    private String userId;
    private String userCode;
    private String fullName;
    private String email;
    private String role;
    private boolean hasPassword;
    private boolean active;
    private LocalDateTime bannedUntil;

    public AuthResponse() {
    }

    public AuthResponse(String message, String userId, String userCode, String fullName, String email, String role) {
        this.message = message;
        this.userId = userId;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public AuthResponse(String message, String userId, String userCode, String fullName, String email, String role, boolean hasPassword) {
        this.message = message;
        this.userId = userId;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.hasPassword = hasPassword;
    }

    public AuthResponse(String message,
                        String userId,
                        String userCode,
                        String fullName,
                        String email,
                        String role,
                        boolean hasPassword,
                        boolean active,
                        LocalDateTime bannedUntil) {
        this.message = message;
        this.userId = userId;
        this.userCode = userCode;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.hasPassword = hasPassword;
        this.active = active;
        this.bannedUntil = bannedUntil;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public boolean isHasPassword() {
        return hasPassword;
    }

    public void setHasPassword(boolean hasPassword) {
        this.hasPassword = hasPassword;
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
}
