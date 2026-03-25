package com.campusconnect.repository.component1;

import com.campusconnect.entity.component1.User;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByStudentId(String studentId);

    long countByBatch_BatchIdAndRole_RoleName(Long batchId, String roleName);

}

