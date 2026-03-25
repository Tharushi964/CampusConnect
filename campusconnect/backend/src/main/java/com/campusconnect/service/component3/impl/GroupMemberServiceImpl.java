package com.campusconnect.service.component3.impl;

import com.campusconnect.dto.component3.GroupMemberDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component3.GroupMember;
import com.campusconnect.entity.component3.GroupMemberId;
import com.campusconnect.entity.component3.StudyGroup;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component3.GroupMemberRepository;
import com.campusconnect.repository.component3.StudyGroupRepository;
import com.campusconnect.service.component3.GroupMemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupMemberServiceImpl implements GroupMemberService {

    private final GroupMemberRepository repository;
    private final StudyGroupRepository groupRepository;
    private final UserRepository userRepository;

    // ✅ JOIN GROUP
    @Override
    public GroupMemberDtos.Response join(GroupMemberDtos.Request request) {

        StudyGroup group = groupRepository.findById(request.groupId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Group not found"));

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        GroupMemberId id = new GroupMemberId(group.getGroupId(), user.getUserId());

        if (repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already in group");
        }

        GroupMember member = new GroupMember();
        member.setId(id);
        member.setStudyGroup(group);
        member.setUser(user);
        member.setJoinedAt(LocalDateTime.now());

        return toResponse(repository.save(member));
    }

    // ✅ LEAVE GROUP
    @Override
    public void leave(Long groupId, Long userId) {

        GroupMemberId id = new GroupMemberId(groupId, userId);

        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Membership not found");
        }

        repository.deleteById(id);
    }

    // ✅ GET MEMBERS BY GROUP
    @Override
    public List<GroupMemberDtos.Response> getByGroup(Long groupId) {
        return repository.findByStudyGroup_GroupId(groupId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // 🔄 Mapper
    private GroupMemberDtos.Response toResponse(GroupMember m) {
        return new GroupMemberDtos.Response(
                m.getStudyGroup().getGroupId(),
                m.getUser().getUserId(),
                m.getJoinedAt()
        );
    }
}