package com.campusconnect.controller.component3;

import com.campusconnect.dto.component3.SessionAttendanceDtos;
import com.campusconnect.service.component3.SessionAttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/session-attendance")
@RequiredArgsConstructor
public class SessionAttendanceController {

    private final SessionAttendanceService service;

    // ✅ MARK
    @PostMapping("/mark")
    public SessionAttendanceDtos.Response mark(@RequestBody SessionAttendanceDtos.Request request) {
        return service.mark(request);
    }

    // ✅ REMOVE
    @DeleteMapping("/remove")
    public void remove(@RequestParam Long sessionId,
                       @RequestParam Long userId) {
        service.remove(sessionId, userId);
    }

    // ✅ GET BY SESSION
    @GetMapping("/getBySession")
    public List<SessionAttendanceDtos.Response> getBySession(@RequestParam Long sessionId) {
        return service.getBySession(sessionId);
    }

    // ✅ GET BY USER
    @GetMapping("/getByUser")
    public List<SessionAttendanceDtos.Response> getByUser(@RequestParam Long userId) {
        return service.getByUser(userId);
    }
}