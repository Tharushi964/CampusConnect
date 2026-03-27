package com.campusconnect.service.component4.impl;

import com.campusconnect.dto.component4.RatingDtos;
import com.campusconnect.entity.component1.User;
import com.campusconnect.entity.component4.Rating;
import com.campusconnect.repository.component1.UserRepository;
import com.campusconnect.repository.component4.RatingRepository;
import com.campusconnect.service.component4.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final UserRepository userRepository;

    @Override
    public RatingDtos.Response createOrUpdate(RatingDtos.Request request) {

        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Rating rating = ratingRepository
                .findByUser_UserIdAndEntityTypeAndEntityId(
                        request.userId(),
                        request.entityType(),
                        request.entityId()
                )
                .orElse(null);

        if (rating == null) {
            rating = new Rating();
            rating.setCreatedAt(LocalDateTime.now());
        } else {
            rating.setUpdatedAt(LocalDateTime.now());
        }

        rating.setEntityType(request.entityType());
        rating.setEntityId(request.entityId());
        rating.setRatingValue(request.ratingValue());
        rating.setComment(request.comment());
        rating.setUser(user);

        return toResponse(ratingRepository.save(rating));
    }

    @Override
    public RatingDtos.Response getById(Long ratingId) {
        return ratingRepository.findById(ratingId)
                .map(this::toResponse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found"));
    }

    @Override
    public List<RatingDtos.Response> getByEntity(String entityType, Long entityId) {
        return ratingRepository.findAll().stream()
                .filter(r -> r.getEntityType().equalsIgnoreCase(entityType)
                        && r.getEntityId().equals(entityId))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<RatingDtos.Response> getByUser(Long userId) {
        return ratingRepository.findAll().stream()
                .filter(r -> r.getUser().getUserId().equals(userId))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public List<RatingDtos.Response> getAll() {
        return ratingRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public void delete(Long ratingId) {
        if (!ratingRepository.existsById(ratingId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not found");
        }
        ratingRepository.deleteById(ratingId);
    }

    private RatingDtos.Response toResponse(Rating r) {
        return new RatingDtos.Response(
                r.getRatingId(),
                r.getEntityType(),
                r.getEntityId(),
                r.getRatingValue(),
                r.getComment(),
                r.getCreatedAt(),
                r.getUpdatedAt(),
                r.getUser() == null ? null : r.getUser().getUserId()
        );
    }
}