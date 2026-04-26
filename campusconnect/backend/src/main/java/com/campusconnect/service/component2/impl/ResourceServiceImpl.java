package com.campusconnect.service.component2.impl;

import com.campusconnect.dto.component2.ResourceDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component2.Subject;
import com.campusconnect.entity.component2.Resource;
import com.campusconnect.entity.component2.ResourceFile;
import com.campusconnect.entity.component2.ResourceHistory;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component2.SubjectRepository;
import com.campusconnect.repository.component2.ResourceHistoryRepository;
import com.campusconnect.repository.component2.ResourceRepository;
import com.campusconnect.service.component2.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final SubjectRepository subjectRepository;
    private final UserRepository userRepository;
    private final ResourceHistoryRepository resourceHistoryRepository;

    @Override
    public ResourceDtos.Response create(ResourceDtos.Request request) {

        Subject subject = subjectRepository.findById(request.subjectId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Subject not found"));

        User user = userRepository.findById(request.createdByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Resource resource = new Resource();
        resource.setName(request.name());
        resource.setVersion(1);
        resource.setCreatedDate(LocalDateTime.now());
        resource.setUpdatedDate(LocalDateTime.now());
        resource.setCreatedBy(user);
        resource.setUpdatedBy(user);
        resource.setSubject(subject);

        // files
        if (request.fileUrls() != null) {
            List<ResourceFile> files = request.fileUrls().stream().map(url -> {
                ResourceFile file = new ResourceFile();
                file.setFileUrl(url);
                file.setResource(resource);
                return file;
            }).toList();
            resource.setFiles(files);
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceDtos.Response update(Long resourceId, ResourceDtos.UpdateRequest request) {

        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));

        User user = userRepository.findById(request.updatedByUserId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 🔥 Save history BEFORE updating
        ResourceHistory history = new ResourceHistory();
        history.setName(resource.getName());
        history.setVersion(resource.getVersion());
        history.setUpdatedDate(LocalDateTime.now());
        history.setUpdatedBy(user);
        history.setResource(resource);

        // (Assuming you have history repo → you can save it)
        resourceHistoryRepository.save(history); 

        // update resource
        resource.setName(request.name());
        resource.setVersion(resource.getVersion() + 1);
        resource.setUpdatedDate(LocalDateTime.now());
        resource.setUpdatedBy(user);

        // replace files
        if (request.fileUrls() != null) {
            List<ResourceFile> files = request.fileUrls().stream().map(url -> {
                ResourceFile file = new ResourceFile();
                file.setFileUrl(url);
                file.setResource(resource);
                return file;
            }).toList();
            resource.setFiles(files);
        }

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceDtos.Response getById(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    @Override
    public List<ResourceDtos.Response> getAll() {
        return resourceRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public List<ResourceDtos.Response> getBySubject(Long subjectId) {
        return resourceRepository.findBySubject_SubjectId(subjectId)
                .stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found");
        }
        resourceRepository.deleteById(resourceId);
    }

    private ResourceDtos.Response toResponse(Resource r) {
        return new ResourceDtos.Response(
                r.getResourceId(),
                r.getName(),
                r.getVersion(),
                r.getCreatedDate(),
                r.getUpdatedDate(),
                r.getSubject() == null ? null : r.getSubject().getSubjectId(),
                r.getCreatedBy() == null ? null : r.getCreatedBy().getUserId(),
                r.getUpdatedBy() == null ? null : r.getUpdatedBy().getUserId(),
                r.getFiles() == null ? List.of() :
                        r.getFiles().stream().map(ResourceFile::getFileUrl).toList()
        );
    }
}
