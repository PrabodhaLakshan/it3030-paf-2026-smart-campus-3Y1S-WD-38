package com.flexit.repository;

import com.flexit.model.User;
import com.flexit.model.UserRole;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUserCodeIgnoreCase(String userCode);

    boolean existsByEmailIgnoreCase(String email);

    List<User> findByRole(UserRole role);

    long countByRole(UserRole role);
}
