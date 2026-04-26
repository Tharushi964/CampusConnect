package com.campusconnect.entity.component2;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "program")
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long programId;

    private String programName;

    private Integer durationYears;

    private String status;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;


}