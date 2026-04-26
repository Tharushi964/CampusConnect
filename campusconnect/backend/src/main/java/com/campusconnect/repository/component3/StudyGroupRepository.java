package com.campusconnect.repository.component3;

import com.campusconnect.entity.component3.StudyGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudyGroupRepository extends JpaRepository<StudyGroup, Long> {
	List<StudyGroup> findBySemester_SemesterId(Long semesterId);

	List<StudyGroup> findByCreatedBy_UserId(Long userId);
}

