package com.campusconnect.repository.component1;

import com.campusconnect.entity.component1.Feedback;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findBySession_SessionId(Long sessionId);

    List<Feedback> findByUser_UserId(Long userId);

    List<Feedback> findBySession_Program_Faculty_Name(String faculty);

    List<Feedback> findBySession_Program_Name(String program);

    List<Feedback> findBySession_Program_ProgramNameAndSession_Year(String programName, int year);

    List<Feedback> findBySession_Program_NameAndSession_YearAndSession_Semester(
            String program, int year, int semester);

    
}

