package com.campusconnect.controller.component1;

import com.campusconnect.dto.component1.BatchRepRequestDtos;
import com.campusconnect.service.component1.BatchRepRequestService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/batchrep")
@RequiredArgsConstructor
public class AdminBatchRepController {

    private final BatchRepRequestService service;

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @GetMapping("/requests")
    public List<BatchRepRequestDtos.Response> getPendingRequests(){
        return service.getPendingRequests();
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/approve")
    public BatchRepRequestDtos.Response approve(
        @RequestParam Long requestId
    ){
        return service.approveRequest(requestId);
    }

    @PreAuthorize("hasAnyAuthority('ADMIN')")
    @PutMapping("/reject")
    public BatchRepRequestDtos.Response reject(
        @RequestParam Long requestId
    ){
        return service.rejectRequest(requestId);
    }

}
