package com.itmc.payment_service.controller;

import com.itmc.payment_service.dto.ChangePasswordRequest;
import com.itmc.payment_service.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AuthService authService;

    public UserController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String studentId = authentication.getName(); // The principal is the studentId

            authService.changePassword(studentId, request.getOldPassword(), request.getNewPassword());
            
            return ResponseEntity.ok(Map.of("success", true, "message", "Đổi mật khẩu thành công."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }
}
