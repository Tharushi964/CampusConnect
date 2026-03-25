package com.campusconnect.service.component1.impl;

import com.campusconnect.dto.component1.FeedbackDtos;
import com.campusconnect.entity.component1.Feedback;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component3.Session;
import com.campusconnect.repository.component1.FeedbackRepository;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component3.SessionRepository;
import com.campusconnect.service.component1.FeedbackService;


import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FeedbackServiceImpl implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final SessionRepository sessionRepository; // ✅ ADD THIS

    @Override
    public FeedbackDtos.Response create(FeedbackDtos.Request request) {

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Session session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));

        Feedback feedback = new Feedback();
        feedback.setFeedbackType(request.feedbackType());
        feedback.setMessage(request.message());
        feedback.setStatus(request.status());
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUser(user);
        feedback.setSession(session); // ✅ FIX

        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    public FeedbackDtos.Response update(Long feedbackId, FeedbackDtos.Request request) {

        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));

        if (request.feedbackType() != null) {
            feedback.setFeedbackType(request.feedbackType());
        }

        if (request.message() != null) {
            feedback.setMessage(request.message());
        }

        if (request.status() != null) {
            feedback.setStatus(request.status());
        }

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
            feedback.setUser(user);
        }

        if (request.sessionId() != null) {
            Session session = sessionRepository.findById(request.sessionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session not found"));
            feedback.setSession(session);
        }

        return toResponse(feedbackRepository.save(feedback));
    }

    @Override
    public FeedbackDtos.Response getById(Long feedbackId) {
        return feedbackRepository.findById(feedbackId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found"));
    }

    @Override
    public List<FeedbackDtos.Response> getBySessionId(Long sessionId) {
        return feedbackRepository.findBySession_SessionId(sessionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<FeedbackDtos.Response> getByUserId(Long userId) {
        return feedbackRepository.findByUser_UserId(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<FeedbackDtos.Response> getAll() {
        return feedbackRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Feedback not found");
        }
        feedbackRepository.deleteById(feedbackId);
    }

    private FeedbackDtos.Response toResponse(Feedback feedback) {
        return new FeedbackDtos.Response(
                feedback.getFeedbackId(),
                feedback.getFeedbackType(),
                feedback.getMessage(),
                feedback.getStatus(),
                feedback.getCreatedAt(),
                feedback.getUser() == null ? null : feedback.getUser().getUserId(),
                feedback.getSession() == null ? null : feedback.getSession().getSessionId() // ✅ FIXED
        );
    }
}