package com.campusconnect.entity.component3;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

import com.campusconnect.entity.component1.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "group_member")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMember {

    @EmbeddedId
    private GroupMemberId id;

    private LocalDateTime joinedAt;

    @ManyToOne
    @MapsId("groupId")
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private StudyGroup studyGroup;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
