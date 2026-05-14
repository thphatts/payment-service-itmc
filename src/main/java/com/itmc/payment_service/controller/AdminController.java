package com.itmc.payment_service.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepo;

    public AdminController(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @PostMapping("/users/import")
    public ResponseEntity<String> importUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is empty");
        }

        List<User> newUsers = new ArrayList<>();
        int duplicateCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;

            // Đọc từng dòng của file CSV
            while ((line = reader.readLine()) != null) {
                // Bỏ qua dòng tiêu đề đầu tiên
                if (isFirstLine) {
                    isFirstLine = false;
                    continue; 
                }

                // Tách dữ liệu bằng dấu phẩy
                String[] data = line.split(",");
                if (data.length >= 3) {
                    String studentId = data[0].trim().toUpperCase();
                    String fullName = data[1].trim();
                    String email = data[2].trim();

                    // Kiểm tra xem sinh viên này đã có trong DB chưa để tránh lỗi Trùng lặp (Unique Constraint)
                    if (userRepo.findByStudentId(studentId).isEmpty()) {
                        User user = new User();
                        user.setStudentId(studentId);
                        user.setFullName(fullName);
                        user.setEmail(email);
                        // user.setRole("MEMBER"); // Bật lên nếu Entity của bạn có trường role
                        
                        newUsers.add(user);
                    } else {
                        duplicateCount++;
                    }
                }
            }

            // Lưu toàn bộ danh sách mới vào Database trong 1 lần (Tối ưu hiệu suất)
            if (!newUsers.isEmpty()) {
                userRepo.saveAll(newUsers);
            }

            String resultMsg = String.format("Import thành công %d thành viên. Bỏ qua %d thành viên đã tồn tại.", newUsers.size(), duplicateCount);
            return ResponseEntity.ok(resultMsg);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Lỗi khi đọc file: " + e.getMessage());
        }
    }
}