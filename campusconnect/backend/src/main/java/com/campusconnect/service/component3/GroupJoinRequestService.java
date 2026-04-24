package com.campusconnect.service.component3;

import com.campusconnect.dto.component1.BatchRepRequestDtos;

import java.util.List;

public interface GroupJoinRequestService {

    List<BatchRepRequestDtos.Response> getPendingRequests();

    BatchRepRequestDtos.Response approveRequest(Long requestId);

    BatchRepRequestDtos.Response rejectRequest(Long requestId);

}
 