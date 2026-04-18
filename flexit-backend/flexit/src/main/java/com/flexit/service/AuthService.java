package com.flexit.service;

import com.flexit.dto.AuthResponse;
import com.flexit.dto.LoginRequest;
import com.flexit.dto.SignupRequest;
import com.flexit.exception.InvalidCredentialsException;
import com.flexit.exception.UserAlreadyExistsException;
import com.flexit.model.User;
import com.flexit.model.UserRole;
import com.flexit.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public AuthResponse register(SignupRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.USER);
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        UserRole role = resolveRole(savedUser);

        return new AuthResponse(
                "Account created successfully",
                savedUser.getId(),
                savedUser.getFullName(),
            savedUser.getEmail(),
            role.name()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        UserRole role = resolveRole(user);

        return new AuthResponse(
                "Login successful",
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                role.name()
        );
    }

    private UserRole resolveRole(User user) {
        return user.getRole() == null ? UserRole.USER : user.getRole();
    }
}
