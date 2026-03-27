package com.campusconnect.repository.component2;


import com.campusconnect.entity.component2.ResourceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceHistoryRepository extends JpaRepository<ResourceHistory, Long> {

    List<ResourceHistory> findByResource_ResourceId(Long resourceId);
}
