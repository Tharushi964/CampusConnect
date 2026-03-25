package com.campusconnect.entity.component3;

import com.campusconnect.entity.component1.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "session_attendance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SessionAttendance {

    @EmbeddedId
    private SessionAttendanceId id;

    private String attendanceStatus;

    @ManyToOne
    @MapsId("sessionId")
    @JoinColumn(name = "session_id")
    @JsonIgnore
    private Session session;

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;
}
