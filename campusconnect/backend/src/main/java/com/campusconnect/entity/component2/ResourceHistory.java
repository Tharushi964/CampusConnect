package com.campusconnect.entity.component2;

import java.time.LocalDateTime;

import com.campusconnect.entity.component1.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "resource_history")
@Data
public class ResourceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    private String name;

    private Integer version;

    private LocalDateTime updatedDate;

    @ManyToOne
    private User updatedBy;

    @ManyToOne
    private Resource resource;
}
