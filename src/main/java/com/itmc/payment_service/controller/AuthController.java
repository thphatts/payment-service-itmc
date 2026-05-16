package com.itmc.payment_service.controller;

import com.itmc.payment_service.dto.AuthResponse;
import com.itmc.payment_service.dto.LoginRequest;
import com.itmc.payment_service.service.AuthService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String[] result = authService.login(loginRequest.getStudentId(), loginRequest.getPassword());
            return ResponseEntity.ok(new AuthResponse(result[0], result[1], result[2]));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi hệ thống: " + e.getMessage()));
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> request) {
        try {
            String studentId = request.get("studentId");
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            authService.changePassword(studentId, oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("success", true, "message", "Đổi mật khẩu thành công!"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("success", false, "message", "Lỗi hệ thống"));
        }
    }
}
