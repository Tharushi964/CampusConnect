package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.CampusDtos;
import com.campusconnect.entity.component2.Campus;
import com.campusconnect.repository.component2.BatchRepository;
import com.campusconnect.repository.component2.CampusRepository;
import com.campusconnect.service.component2.CampusService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampusServiceImpl implements CampusService {
    private final CampusRepository campusRepository;
    private final BatchRepository batchRepository;

    @Override
public CampusDtos.Response create(CampusDtos.Request request) {
    // Check if a campus with the same name already exists
    if (campusRepository.existsByCampusName(request.campusName())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Campus with name '" + request.campusName() + "' already exists"
        );
    }

    Campus campus = new Campus();
    campus.setCampusName(request.campusName());
    campus.setLocation(request.location());
    campus.setStatus(request.status());
    return toResponse(campusRepository.save(campus));
}

    @Override
public CampusDtos.Response update(Long campusId, CampusDtos.Request request) {
    Campus campus = campusRepository.findById(campusId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Campus not found: " + campusId
            ));

    // Check for duplicate name if changing the name
    if (!campus.getCampusName().equals(request.campusName())
            && campusRepository.existsByCampusName(request.campusName())) {
        throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Campus with name '" + request.campusName() + "' already exists"
        );
    }

    campus.setCampusName(request.campusName());
    campus.setLocation(request.location());
    campus.setStatus(request.status());
    return toResponse(campusRepository.save(campus));
}

    @Override
    public CampusDtos.Response activate(Long campusId) {
        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + campusId));

        if ("ACTIVE".equalsIgnoreCase(campus.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Campus is already active");
        }

        campus.setStatus("ACTIVE");
        return toResponse(campusRepository.save(campus));
    }

    @Override
    public CampusDtos.Response deactivate(Long campusId) {
        Campus campus = campusRepository.findById(campusId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + campusId));

        if (!"ACTIVE".equalsIgnoreCase(campus.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Only active campuses can be deactivated");
        }

        boolean hasActiveBatches = batchRepository.existsByCampus_CampusIdAndStatusIgnoreCase(campusId, "ACTIVE");
        if (hasActiveBatches) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Cannot deactivate campus while it has active batches"
            );
        }

        campus.setStatus("INACTIVE");
        return toResponse(campusRepository.save(campus));
    }

    @Override
    public CampusDtos.Response getById(Long campusId) {
        return campusRepository.findById(campusId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + campusId));
    }

    @Override
    public List<CampusDtos.Response> getAll() {
        return campusRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long campusId) {
        if (!campusRepository.existsById(campusId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Campus not found: " + campusId);
        }
        campusRepository.deleteById(campusId);
    }

    private CampusDtos.Response toResponse(Campus campus) {
        return new CampusDtos.Response(
                campus.getCampusId(),
                campus.getCampusName(),
                campus.getLocation(),
                campus.getStatus()
        );
    }
}

