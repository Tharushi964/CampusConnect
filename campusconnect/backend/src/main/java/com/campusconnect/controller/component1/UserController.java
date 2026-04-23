package com.campusconnect.controller.component1;

import com.campusconnect.dto.component1.UserDtos;
import com.campusconnect.service.component1.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/create")
    public UserDtos.Response create(@Valid @RequestBody UserDtos.Request request) {
        return userService.create(request);
    }

    @PutMapping("/update")
    public UserDtos.Response update(
            @RequestParam Long userId,
            @Valid @RequestBody UserDtos.Request request) {
        return userService.update(userId, request);
    }

    @GetMapping("/get")
    public UserDtos.Response getById(@RequestParam Long userId) {
        return userService.getById(userId);
    }

    @GetMapping("/all")
    public List<UserDtos.Response> getAll() {
        return userService.getAll();
    }

    @DeleteMapping("/delete")
    public void delete(@RequestParam Long userId) {
        userService.delete(userId);
    }

    @GetMapping("/verify")
    public String verifyUser(@RequestParam String token) {
        return userService.verifyUser(token);
    }
}