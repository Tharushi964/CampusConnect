package com.campusconnect.entity.component2;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(
    name = "subject",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"curriculum_id", "subject_code"})
    }
)
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long subjectId;

    private String subjectCode;

    private String subjectName;

    private Integer credits;

    @ManyToOne
    @JoinColumn(name = "curriculum_id")
    private Curriculum curriculum;

    @ManyToOne
    @JoinColumn(name = "semester_id")
    private Semester semester;

    
}