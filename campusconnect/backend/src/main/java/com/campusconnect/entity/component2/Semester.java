package com.campusconnect.entity.component2;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;

@Data
@Entity
@Table(
    name = "semester",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"batch_id", "year_number", "semester_number"})
    }
)
public class Semester {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long semesterId;

    private Integer yearNumber;

    private Integer semesterNumber;

    private LocalDate startDate;

    private LocalDate endDate;

    private String status;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;
}
