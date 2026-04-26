package com.flexit.dto;

import jakarta.validation.constraints.NotBlank;

public class UserDeactivationRequest {

    @NotBlank(message = "Duration option is required")
    private String durationOption;

    public String getDurationOption() {
        return durationOption;
    }

    public void setDurationOption(String durationOption) {
        this.durationOption = durationOption;
    }
}
