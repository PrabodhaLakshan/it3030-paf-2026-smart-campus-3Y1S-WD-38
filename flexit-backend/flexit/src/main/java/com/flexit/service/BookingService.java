package com.flexit.service;

import com.flexit.model.Booking;
import com.flexit.model.BookingStatus;
import com.flexit.repository.BookingRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;

    public BookingService(BookingRepository bookingRepository) {
        this.bookingRepository = bookingRepository;
    }

    public Booking createBooking(Booking booking) {
        validateBookingTimes(booking.getStartTime(), booking.getEndTime());
        checkConflict(booking);

        booking.setStatus(BookingStatus.PENDING);
        return bookingRepository.save(booking);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    public Booking getBookingById(String id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
    }

    public List<Booking> getBookingsByResourceId(String resourceId) {
        return bookingRepository.findByResourceId(resourceId);
    }

    public List<Booking> getBookingsByUserId(String userId) {
    return bookingRepository.findByUserId(userId);
    }

    public Booking approveBooking(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    public Booking rejectBooking(String id, String reason) {
    Booking booking = getBookingById(id);
    booking.setStatus(BookingStatus.REJECTED);
    booking.setRejectionReason(reason);
    return bookingRepository.save(booking);
}

    public Booking cancelBooking(String id) {
        Booking booking = getBookingById(id);
        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    public void deleteBooking(String id) {
        Booking booking = getBookingById(id);
        bookingRepository.delete(booking);
    }

    private void validateBookingTimes(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new RuntimeException("Start time and end time are required");
        }

        if (!startTime.isBefore(endTime)) {
            throw new RuntimeException("Start time must be before end time");
        }
    }

    private void checkConflict(Booking newBooking) {
        List<Booking> existingBookings = bookingRepository.findByResourceId(newBooking.getResourceId());

        for (Booking existing : existingBookings) {
            if (existing.getStatus() == BookingStatus.CANCELLED ||
                existing.getStatus() == BookingStatus.REJECTED) {
                continue;
            }

            boolean overlaps =
                    newBooking.getStartTime().isBefore(existing.getEndTime()) &&
                    newBooking.getEndTime().isAfter(existing.getStartTime());

            if (overlaps) {
                throw new RuntimeException("Booking conflict: Resource is already booked for this time range");
            }
        }
    }
}