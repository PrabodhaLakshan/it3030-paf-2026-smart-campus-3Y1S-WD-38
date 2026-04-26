package com.flexit.controller;

import com.flexit.dto.AuthResponse;
import com.flexit.dto.CreateTechnicianRequest;
import com.flexit.dto.GoogleLoginRequest;
import com.flexit.dto.LoginRequest;
import com.flexit.dto.PasswordChangeRequest;
import com.flexit.dto.PasswordStatusResponse;
import com.flexit.dto.PresenceUpdateRequest;
import com.flexit.dto.SignupRequest;
import com.flexit.dto.UserManagementSummaryResponse;
import com.flexit.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody SignupRequest request) {
        AuthResponse response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/google")
    public ResponseEntity<AuthResponse> googleLogin(@Valid @RequestBody GoogleLoginRequest request) {
        return ResponseEntity.ok(authService.googleLogin(request));
    }

    @GetMapping("/password-status/{userId}")
    public ResponseEntity<PasswordStatusResponse> passwordStatus(@PathVariable String userId) {
        return ResponseEntity.ok(authService.getPasswordStatus(userId));
    }

    @PostMapping("/password")
    public ResponseEntity<AuthResponse> setOrChangePassword(@Valid @RequestBody PasswordChangeRequest request) {
        return ResponseEntity.ok(authService.setOrChangePassword(request));
    }

    @GetMapping("/admin/users/summary")
    public ResponseEntity<UserManagementSummaryResponse> getUserManagementSummary() {
        return ResponseEntity.ok(authService.getUserManagementSummary());
    }

    @PostMapping("/admin/users/technicians")
    public ResponseEntity<AuthResponse> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        AuthResponse response = authService.createTechnician(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/admin/users/technicians/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable String id) {
        authService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Void> deleteRegularUser(@PathVariable String id) {
        authService.deleteRegularUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/presence")
    public ResponseEntity<Void> updatePresence(@Valid @RequestBody PresenceUpdateRequest request) {
        authService.updatePresence(request);
        return ResponseEntity.noContent().build();
    }
}
