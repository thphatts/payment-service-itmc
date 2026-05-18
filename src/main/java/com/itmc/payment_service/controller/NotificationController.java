package com.itmc.payment_service.controller;

import com.itmc.payment_service.entity.Notification;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.repository.UserRepository;
import com.itmc.payment_service.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByStudentId(email).orElse(null);
    }

    @GetMapping
    public ResponseEntity<?> getNotifications() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("code", 401, "message", "Unauthorized"));
        
        List<Notification> notifications = notificationService.getUserNotifications(currentUser);
        return ResponseEntity.ok(Map.of("code", 200, "message", "Success", "data", notifications));
    }

    @GetMapping("/unread")
    public ResponseEntity<?> getUnreadNotifications() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("code", 401, "message", "Unauthorized"));
        
        List<Notification> notifications = notificationService.getUnreadUserNotifications(currentUser);
        return ResponseEntity.ok(Map.of("code", 200, "message", "Success", "data", notifications));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("code", 401, "message", "Unauthorized"));
        
        notificationService.markAsRead(id, currentUser);
        return ResponseEntity.ok(Map.of("code", 200, "message", "Success"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        User currentUser = getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).body(Map.of("code", 401, "message", "Unauthorized"));
        
        notificationService.markAllAsRead(currentUser);
        return ResponseEntity.ok(Map.of("code", 200, "message", "Success"));
    }
}

