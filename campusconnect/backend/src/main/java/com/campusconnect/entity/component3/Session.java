package com.campusconnect.entity.component3;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

import com.campusconnect.entity.component1.User;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "session")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Session {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long sessionId;

    private String sessionName;

    private LocalDate sessionDate;

    private LocalTime startTime;

    private LocalTime endTime;

    private String Mode;

    private String location;

    private String Link;

    private String status;

    @ManyToOne
    @JoinColumn(name = "group_id")
    @JsonIgnore
    private StudyGroup studyGroup;

    @ManyToOne
    @JoinColumn(name = "created_by")
    @JsonIgnore
    private User createdBy;
}
