package com.campusconnect.entity.component2;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "resource_file")
@Data
public class ResourceFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long fileId;

    private String fileName;

    private String fileType;

    private String fileUrl; // path or cloud URL

    @ManyToOne
    @JoinColumn(name = "resource_id")
    private Resource resource;
}
