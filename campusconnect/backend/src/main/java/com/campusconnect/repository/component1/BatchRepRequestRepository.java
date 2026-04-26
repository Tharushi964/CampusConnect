package com.campusconnect.repository.component1;

import com.campusconnect.entity.component1.BatchRepRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BatchRepRequestRepository extends JpaRepository<BatchRepRequest, Long> {

    List<BatchRepRequest> findByStatus(String status);

    long deleteByUser_UserId(Long userId);

}
