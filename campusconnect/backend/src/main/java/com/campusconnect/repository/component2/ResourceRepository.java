package com.campusconnect.repository.component2;

import com.campusconnect.entity.component2.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findBySubject_SubjectId(Long subjectId);
}