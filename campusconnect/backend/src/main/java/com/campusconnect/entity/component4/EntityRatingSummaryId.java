package com.campusconnect.entity.component4;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class EntityRatingSummaryId implements Serializable {

    private String entityType;
    private Long entityId;
}
