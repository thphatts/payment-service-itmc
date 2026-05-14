package com.itmc.payment_service.repository;

import com.itmc.payment_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // Hàm này giúp tìm User dựa trên mã sinh viên (phục vụ cho việc parse Regex sau này)
    Optional<User> findByStudentId(String studentId);
}