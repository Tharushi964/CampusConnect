package com.campusconnect.service.component1;

import com.campusconnect.dto.component1.FeedbackDtos;

import java.util.List;

public interface FeedbackService {

    FeedbackDtos.Response create(FeedbackDtos.Request request);

    FeedbackDtos.Response update(Long feedbackId, FeedbackDtos.Request request);

    FeedbackDtos.Response getById(Long feedbackId);

    List<FeedbackDtos.Response> getBySessionId(Long sessionId);

    List<FeedbackDtos.Response> getByUserId(Long userId);

    List<FeedbackDtos.Response> getAll();

    void delete(Long feedbackId);
}

