package com.campusconnect.entity.component4;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.campusconnect.entity.component1.User;

@Entity
@Table(name = "rating")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rating {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long ratingId;

    private String entityType;
    // SUBJECT / SESSION / GROUP / RESOURCE

    private Long entityId;// id of subject/session/group/resource

    private Integer ratingValue;

    private String comment;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
