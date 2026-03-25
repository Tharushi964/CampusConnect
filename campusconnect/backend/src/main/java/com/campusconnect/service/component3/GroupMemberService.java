package com.campusconnect.service.component3;

import com.campusconnect.dto.component3.GroupMemberDtos;

import java.util.List;

public interface GroupMemberService {

    GroupMemberDtos.Response join(GroupMemberDtos.Request request);

    void leave(Long groupId, Long userId);

    List<GroupMemberDtos.Response> getByGroup(Long groupId);
}