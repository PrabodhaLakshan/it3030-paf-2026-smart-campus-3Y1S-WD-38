package com.flexit.dto;

import jakarta.validation.constraints.NotBlank;

public class PresenceUpdateRequest {

    @NotBlank(message = "User id is required")
    private String userId;

    private boolean online;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isOnline() {
        return online;
    }

    public void setOnline(boolean online) {
        this.online = online;
    }
}
