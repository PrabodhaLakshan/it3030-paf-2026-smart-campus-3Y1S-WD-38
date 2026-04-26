package com.flexit.dto;

import java.time.LocalDateTime;

public class AccountAccessStatusResponse {

    private String userId;
    private String userCode;
    private String role;
    private boolean active;
    private LocalDateTime bannedUntil;

    public AccountAccessStatusResponse() {
    }

    public AccountAccessStatusResponse(String userId,
                                       String userCode,
                                       String role,
                                       boolean active,
                                       LocalDateTime bannedUntil) {
        this.userId = userId;
        this.userCode = userCode;
        this.role = role;
        this.active = active;
        this.bannedUntil = bannedUntil;
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
}
