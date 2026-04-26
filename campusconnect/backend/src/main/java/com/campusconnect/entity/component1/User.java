package com.campusconnect.entity.component1;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

import com.campusconnect.entity.component2.Batch;
import com.campusconnect.entity.component2.Campus;
import com.campusconnect.entity.component2.Faculty;
import com.campusconnect.entity.component2.Program;
import com.campusconnect.entity.component2.Semester;

@Data
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    private String firstName;

    private String lastName;

    @Column(unique = true)
    private String studentId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String password;

    private String status;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private Batch batch;

    @ManyToOne
    @JoinColumn(name = "faculty_id")
    private Faculty faculty;

    @ManyToOne
    @JoinColumn(name = "program_id")
    private Program program;

    @ManyToOne
    @JoinColumn(name = "semester_id")
    private Semester semester;

    @ManyToOne
    @JoinColumn(name = "campus_id")
    private Campus campus;
    

}