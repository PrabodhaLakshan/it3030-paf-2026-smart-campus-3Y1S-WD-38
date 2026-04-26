package com.flexit.service;

import com.flexit.dto.AuthResponse;
import com.flexit.dto.AccountAccessStatusResponse;
import com.flexit.dto.CreateTechnicianRequest;
import com.flexit.dto.GoogleLoginRequest;
import com.flexit.dto.LoginRequest;
import com.flexit.dto.PasswordChangeRequest;
import com.flexit.dto.PasswordStatusResponse;
import com.flexit.dto.PresenceUpdateRequest;
import com.flexit.dto.RegisteredTechnicianResponse;
import com.flexit.dto.RegisteredUserResponse;
import com.flexit.dto.SignupRequest;
import com.flexit.dto.UserDeactivationRequest;
import com.flexit.dto.UserManagementSummaryResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.flexit.exception.InvalidCredentialsException;
import com.flexit.exception.UserAlreadyExistsException;
import com.flexit.model.User;
import com.flexit.model.UserRole;
import com.flexit.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoOperations;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final MongoOperations mongoOperations;
    private final PasswordEncoder passwordEncoder;
    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    public AuthService(UserRepository userRepository,
                       MongoOperations mongoOperations,
                       @Value("${google.oauth.client-id}") String googleClientId) {
        this.userRepository = userRepository;
        this.mongoOperations = mongoOperations;
        this.passwordEncoder = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
        this.googleIdTokenVerifier = 
        new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                GsonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(googleClientId))
                .build();
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
        user.setUserCode(generateNextUserCode());
        user.setActive(true);
        user.setBannedUntil(null);
        user.setOnline(false);
        user.setLastSeenAt(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(user);
        UserRole role = resolveRole(savedUser);

        return new AuthResponse(
                "Account created successfully",
                savedUser.getId(),
                savedUser.getUserCode(),
                savedUser.getFullName(),
                savedUser.getEmail(),
            role.name(),
            true,
            savedUser.isActive(),
            savedUser.getBannedUntil()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        applyAutoReactivateIfExpired(user);

        if (user.getPasswordHash() == null || user.getPasswordHash().isBlank()) {
            throw new InvalidCredentialsException("Use Google Login for this account");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String userCode = ensureUserCode(user);
        UserRole role = resolveRole(user);

        user.setOnline(true);
        user.setLastSeenAt(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(
                "Login successful",
                user.getId(),
                userCode,
                user.getFullName(),
                user.getEmail(),
            role.name(),
            true,
            user.isActive(),
            user.getBannedUntil()
        );
    }

    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleIdToken idToken = verifyGoogleToken(request.getIdToken());
        GoogleIdToken.Payload payload = idToken.getPayload();

        String email = payload.getEmail();
        Boolean emailVerified = payload.getEmailVerified();

        if (email == null || !Boolean.TRUE.equals(emailVerified)) {
            throw new InvalidCredentialsException("Google account email is not verified");
        }

        String normalizedEmail = email.trim().toLowerCase();
        String fullName = extractFullName(payload, normalizedEmail);

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseGet(() -> createGoogleUser(normalizedEmail, fullName));

        applyAutoReactivateIfExpired(user);

        String userCode = ensureUserCode(user);
        UserRole role = resolveRole(user);

        user.setOnline(true);
        user.setLastSeenAt(LocalDateTime.now());
        userRepository.save(user);

        return new AuthResponse(
                "Google login successful",
                user.getId(),
                userCode,
                user.getFullName(),
                user.getEmail(),
            role.name(),
            user.getPasswordHash() != null && !user.getPasswordHash().isBlank(),
            user.isActive(),
            user.getBannedUntil()
        );
    }

    public PasswordStatusResponse getPasswordStatus(String userId) {
        String safeUserId = Objects.requireNonNullElse(userId, "").trim();

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        applyAutoReactivateIfExpired(user);

        boolean hasPassword = user.getPasswordHash() != null && !user.getPasswordHash().isBlank();
        return new PasswordStatusResponse(user.getId(), hasPassword);
    }

    public UserManagementSummaryResponse getUserManagementSummary() {
        long userCount = userRepository.countByRole(UserRole.USER);
        long technicianCount = userRepository.countByRole(UserRole.TECHNICIAN);
        long adminCount = userRepository.countByRole(UserRole.ADMIN);

        List<RegisteredTechnicianResponse> technicians = userRepository.findByRole(UserRole.TECHNICIAN)
                .stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> new RegisteredTechnicianResponse(
                        user.getId(),
                        user.getUserCode(),
                        user.getFullName(),
                        user.getEmail(),
                user.getContactNumber(),
                user.getCategories(),
                user.getAssignedArea(),
                        user.getCreatedAt()
                ))
                .toList();

            List<RegisteredUserResponse> users = userRepository.findByRole(UserRole.USER)
                .stream()
                .peek(this::applyAutoReactivateIfExpired)
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(user -> new RegisteredUserResponse(
                    user.getId(),
                    user.getUserCode(),
                    user.getFullName(),
                    user.getEmail(),
                    user.getRole() == null ? UserRole.USER.name() : user.getRole().name(),
                    user.isActive(),
                    user.getBannedUntil(),
                    user.isOnline(),
                    user.getLastSeenAt(),
                    user.getCreatedAt()
                ))
                .toList();

            return new UserManagementSummaryResponse(userCount, technicianCount, adminCount, technicians, users);
    }

    public AuthResponse createTechnician(CreateTechnicianRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new UserAlreadyExistsException("Email is already registered");
        }

        User technician = new User();
        technician.setFullName(request.getFullName().trim());
        technician.setEmail(normalizedEmail);
        technician.setPasswordHash(null);
        technician.setContactNumber(request.getContactNumber().trim());
        technician.setCategories(request.getCategories().stream().map(String::trim).filter(value -> !value.isBlank()).distinct().toList());
        technician.setAssignedArea(request.getAssignedArea().trim());
        technician.setRole(UserRole.TECHNICIAN);
        technician.setUserCode(generateNextUserCode());
        technician.setActive(true);
        technician.setBannedUntil(null);
        technician.setOnline(false);
        technician.setLastSeenAt(LocalDateTime.now());
        technician.setCreatedAt(LocalDateTime.now());

        User savedTechnician = userRepository.save(technician);

        return new AuthResponse(
                "Technician account created successfully",
                savedTechnician.getId(),
                savedTechnician.getUserCode(),
                savedTechnician.getFullName(),
                savedTechnician.getEmail(),
                UserRole.TECHNICIAN.name(),
            false,
            savedTechnician.isActive(),
            savedTechnician.getBannedUntil()
        );
    }

    public AccountAccessStatusResponse getAccountAccessStatus(String userIdOrCode) {
        User user = resolveUserByIdOrCode(userIdOrCode);
        applyAutoReactivateIfExpired(user);

        UserRole role = resolveRole(user);
        return new AccountAccessStatusResponse(
                user.getId(),
                user.getUserCode(),
                role.name(),
                user.isActive(),
                user.getBannedUntil()
        );
    }

    public AccountAccessStatusResponse deactivateUser(String userId, UserDeactivationRequest request) {
        String safeUserId = Objects.requireNonNullElse(userId, "").trim();
        if (safeUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (resolveRole(user) != UserRole.USER) {
            throw new IllegalArgumentException("Only USER role accounts can be deactivated from this table");
        }

        String durationOption = request == null ? "" : Objects.requireNonNullElse(request.getDurationOption(), "").trim().toUpperCase();
        if (durationOption.isBlank()) {
            throw new IllegalArgumentException("Duration option is required");
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bannedUntil = switch (durationOption) {
            case "UNTIL_REACTIVE" -> null;
            case "1_MIN" -> now.plusMinutes(1);
            case "15_MIN" -> now.plusMinutes(15);
            case "30_MIN" -> now.plusMinutes(30);
            case "1_HOUR" -> now.plusHours(1);
            case "2_HOUR" -> now.plusHours(2);
            case "1_DAY" -> now.plusDays(1);
            case "5_DAY" -> now.plusDays(5);
            case "1_WEEK" -> now.plusWeeks(1);
            default -> throw new IllegalArgumentException("Invalid duration option");
        };

        user.setActive(false);
        user.setBannedUntil(bannedUntil);
        user.setOnline(false);
        user.setLastSeenAt(now);
        User savedUser = userRepository.save(user);

        return new AccountAccessStatusResponse(
                savedUser.getId(),
                savedUser.getUserCode(),
                UserRole.USER.name(),
                savedUser.isActive(),
                savedUser.getBannedUntil()
        );
    }

    public AccountAccessStatusResponse reactivateUser(String userId) {
        String safeUserId = Objects.requireNonNullElse(userId, "").trim();
        if (safeUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (resolveRole(user) != UserRole.USER) {
            throw new IllegalArgumentException("Only USER role accounts can be reactivated from this table");
        }

        user.setActive(true);
        user.setBannedUntil(null);
        User savedUser = userRepository.save(user);

        return new AccountAccessStatusResponse(
                savedUser.getId(),
                savedUser.getUserCode(),
                UserRole.USER.name(),
                savedUser.isActive(),
                savedUser.getBannedUntil()
        );
    }

    public void deleteTechnician(String technicianId) {
        String safeTechnicianId = Objects.requireNonNullElse(technicianId, "").trim();
        if (safeTechnicianId.isBlank()) {
            throw new IllegalArgumentException("Technician id is required");
        }

        User technician = userRepository.findById(safeTechnicianId)
                .orElseThrow(() -> new IllegalArgumentException("Technician not found"));

        if (technician.getRole() != UserRole.TECHNICIAN) {
            throw new IllegalArgumentException("Only technician accounts can be removed from this list");
        }

        userRepository.delete(technician);
    }

    public void deleteRegularUser(String userId) {
        String safeUserId = Objects.requireNonNullElse(userId, "").trim();
        if (safeUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getRole() != UserRole.USER) {
            throw new IllegalArgumentException("Only regular users can be removed from this list");
        }

        userRepository.delete(user);
    }

    public void updatePresence(PresenceUpdateRequest request) {
        String safeUserId = Objects.requireNonNullElse(request.getUserId(), "").trim();
        if (safeUserId.isBlank()) {
            throw new IllegalArgumentException("User id is required");
        }

        User user = userRepository.findById(safeUserId)
                .or(() -> userRepository.findByUserCodeIgnoreCase(safeUserId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        applyAutoReactivateIfExpired(user);

        user.setOnline(request.isOnline());
        user.setLastSeenAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public AuthResponse setOrChangePassword(PasswordChangeRequest request) {
        String safeUserId = Objects.requireNonNullElse(request.getUserId(), "").trim();

        User user = userRepository.findById(safeUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String existingHash = user.getPasswordHash();
        boolean hasPassword = existingHash != null && !existingHash.isBlank();

        if (hasPassword) {
            String currentPassword = request.getCurrentPassword() == null ? "" : request.getCurrentPassword();
            if (currentPassword.isBlank()) {
                throw new InvalidCredentialsException("Current password is required");
            }

            if (!passwordEncoder.matches(currentPassword, existingHash)) {
                throw new InvalidCredentialsException("Current password is incorrect");
            }
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        User savedUser = userRepository.save(user);
        UserRole role = resolveRole(savedUser);

        String message = hasPassword
                ? "Password changed successfully"
                : "Password set successfully. You can now log in with email/password and Google.";

        return new AuthResponse(
                message,
                savedUser.getId(),
                savedUser.getUserCode(),
                savedUser.getFullName(),
                savedUser.getEmail(),
            role.name(),
            true,
            savedUser.isActive(),
            savedUser.getBannedUntil()
        );
    }

    private GoogleIdToken verifyGoogleToken(String tokenValue) {
        try {
            GoogleIdToken idToken = googleIdTokenVerifier.verify(tokenValue);
            if (idToken == null) {
                throw new InvalidCredentialsException("Invalid Google token");
            }

            String issuer = idToken.getPayload().getIssuer();
            if (!"accounts.google.com".equals(issuer)
                    && !"https://accounts.google.com".equals(issuer)) {
                throw new InvalidCredentialsException("Invalid Google token issuer");
            }

            return idToken;
        } catch (InvalidCredentialsException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Google token verification failed");
        }
    }

    private String extractFullName(GoogleIdToken.Payload payload, String fallbackEmail) {
        Object nameValue = payload.get("name");
        if (nameValue instanceof String name && !name.isBlank()) {
            return name.trim();
        }

        int atIndex = fallbackEmail.indexOf('@');
        if (atIndex > 0) {
            return fallbackEmail.substring(0, atIndex);
        }

        return "Google User";
    }

    private User createGoogleUser(String normalizedEmail, String fullName) {
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(normalizedEmail);
        user.setPasswordHash(null);
        user.setRole(UserRole.USER);
        user.setUserCode(generateNextUserCode());
        user.setActive(true);
        user.setBannedUntil(null);
        user.setOnline(false);
        user.setLastSeenAt(LocalDateTime.now());
        user.setCreatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    private User resolveUserByIdOrCode(String userIdOrCode) {
        String safeValue = Objects.requireNonNullElse(userIdOrCode, "").trim();
        if (safeValue.isBlank()) {
            throw new IllegalArgumentException("User identifier is required");
        }

        return userRepository.findById(safeValue)
                .or(() -> userRepository.findByUserCodeIgnoreCase(safeValue))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private void applyAutoReactivateIfExpired(User user) {
        if (user == null || user.isActive() || user.getBannedUntil() == null) {
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(user.getBannedUntil())) {
            return;
        }

        user.setActive(true);
        user.setBannedUntil(null);
        userRepository.save(user);
    }

    private String ensureUserCode(User user) {
        if (user.getUserCode() != null && !user.getUserCode().isBlank()) {
            return user.getUserCode();
        }

        user.setUserCode(generateNextUserCode());
        User savedUser = userRepository.save(user);
        return savedUser.getUserCode();
    }

    private String generateNextUserCode() {
        Query query = new Query(Criteria.where("_id").is("user_code"));
        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options().upsert(true).returnNew(true);

        SequenceCounter counter = mongoOperations.findAndModify(
                query,
                update,
                options,
                SequenceCounter.class,
                "counters"
        );

        if (counter == null || counter.getSeq() <= 0) {
            throw new IllegalStateException("Unable to generate user code");
        }

        return String.format("user%03d", counter.getSeq());
    }

    private static final class SequenceCounter {
        private long seq;

        public long getSeq() {
            return seq;
        }

        public void setSeq(long seq) {
            this.seq = seq;
        }
    }

    private UserRole resolveRole(User user) {
        return user.getRole() == null ? UserRole.USER : user.getRole();
    }

}
