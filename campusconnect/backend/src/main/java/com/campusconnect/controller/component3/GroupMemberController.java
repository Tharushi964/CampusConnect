package com.campusconnect.controller.component3;

import com.campusconnect.dto.component3.GroupMemberDtos;
import com.campusconnect.service.component3.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/group-members")
@RequiredArgsConstructor
public class GroupMemberController {

    private final GroupMemberService service;

    // ✅ JOIN
    @PostMapping("/join")
    public GroupMemberDtos.Response join(@RequestBody GroupMemberDtos.Request request) {
        return service.join(request);
    }

    // ✅ LEAVE
    @DeleteMapping("/leave")
    public void leave(@RequestParam Long groupId,
                      @RequestParam Long userId) {
        service.leave(groupId, userId);
    }

    // ✅ GET MEMBERS
    @GetMapping("/getMembers")
    public List<GroupMemberDtos.Response> getByGroup(@RequestParam Long groupId) {
        return service.getByGroup(groupId);
    }
}