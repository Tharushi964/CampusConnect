package com.campusconnect.repository.component4;

import com.campusconnect.entity.component4.Rating;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface RatingRepository extends JpaRepository<Rating, Long> {

    List<Rating> findByEntityTypeAndEntityId(String entityType, Long entityId);

    List<Rating> findByUser_UserId(Long userId);

    Optional<Rating> findByUser_UserIdAndEntityTypeAndEntityId(
            Long userId, String entityType, Long entityId
    );
}
