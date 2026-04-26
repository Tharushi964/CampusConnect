package com.campusconnect.repository.component4;

import com.campusconnect.entity.component4.EntityRatingSummary;
import com.campusconnect.entity.component4.EntityRatingSummaryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EntityRatingSummaryRepository extends JpaRepository<EntityRatingSummary, EntityRatingSummaryId> {
}

