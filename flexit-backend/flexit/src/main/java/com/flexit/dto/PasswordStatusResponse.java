package com.flexit.dto;

public class PasswordStatusResponse {

    private String userId;
    private boolean hasPassword;

    public PasswordStatusResponse() {
    }

    public PasswordStatusResponse(String userId, boolean hasPassword) {
        this.userId = userId;
        this.hasPassword = hasPassword;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public boolean isHasPassword() {
        return hasPassword;
    }

    public void setHasPassword(boolean hasPassword) {
        this.hasPassword = hasPassword;
    }
}
