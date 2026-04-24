package com.campusconnect.repository.component3;

import com.campusconnect.entity.component3.StudyGroup;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
    List<StudyGroup> findBySemester_SemesterId(Long semesterId);
}

