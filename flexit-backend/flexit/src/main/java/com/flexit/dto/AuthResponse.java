package com.flexit.dto;

public class AuthResponse {

    private String message;
    private String userId;
    private String fullName;
    private String email;

    public AuthResponse() {
    }

    public AuthResponse(String message, String userId, String fullName, String email) {
        this.message = message;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
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
}
