package com.flexit.dto;

import jakarta.validation.constraints.NotBlank;

public class GithubLoginRequest {

    @NotBlank(message = "GitHub authorization code is required")
    private String code;

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
