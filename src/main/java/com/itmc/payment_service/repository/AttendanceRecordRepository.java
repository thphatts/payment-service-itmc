package com.itmc.payment_service.repository;

import com.itmc.payment_service.entity.AttendanceRecord;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    
    List<AttendanceRecord> findByEventId(Long eventId);
    
    Optional<AttendanceRecord> findByEventIdAndUserStudentId(Long eventId, String studentId);
    
    List<AttendanceRecord> findByUser(User user);
    
    @Query("SELECT COUNT(a) FROM AttendanceRecord a WHERE a.user = :user AND a.status = :status")
    long countByUserAndStatus(@Param("user") User user, @Param("status") AttendanceStatus status);
}
