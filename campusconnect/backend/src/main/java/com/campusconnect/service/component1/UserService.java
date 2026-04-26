package com.campusconnect.service.component1;

import com.campusconnect.dto.component1.UserDtos;

import java.util.List;

public interface UserService {
    UserDtos.Response create(UserDtos.Request request);

    UserDtos.Response update(Long userId, UserDtos.Request request);

    UserDtos.Response getById(Long userId);

    List<UserDtos.Response> getAll();

    void delete(Long userId);
}

