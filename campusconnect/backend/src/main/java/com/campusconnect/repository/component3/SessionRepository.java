package com.campusconnect.repository.component3;

import com.campusconnect.entity.component3.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
	List<Session> findByStudyGroup_GroupId(Long groupId);

	List<Session> findByCreatedBy_UserId(Long userId);

	List<Session> findByStudyGroup_GroupIdAndSessionDateBefore(Long groupId, LocalDate date);

	List<Session> findByStatusIgnoreCaseAndReminderSentAtIsNull(String status);
}

