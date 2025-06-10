package dev.tylerpac.momentum.repository;

import dev.tylerpac.momentum.model.Users;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<Users, Long> {
    Users findByUsername(String username);
}

