package com.campusconnect.repository.component3;

import com.campusconnect.entity.component3.SessionAttendance;
import com.campusconnect.entity.component3.SessionAttendanceId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionAttendanceRepository extends JpaRepository<SessionAttendance, SessionAttendanceId> {

    List<SessionAttendance> findBySession_SessionId(Long sessionId);

    List<SessionAttendance> findByUser_UserId(Long userId);
}