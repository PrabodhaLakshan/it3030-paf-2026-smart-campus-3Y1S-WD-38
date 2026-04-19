package com.flexit.repository;

import com.flexit.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByResourceId(String resourceId);
    List<Booking> findByUserId(String userId);
}
