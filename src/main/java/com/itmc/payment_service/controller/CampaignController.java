package com.itmc.payment_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.itmc.payment_service.dto.QrResponse;
import com.itmc.payment_service.repository.UserRepository;
import com.itmc.payment_service.service.CampaignService;

import java.util.Map;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {
    private final CampaignService campaignService;
    private final UserRepository userRepository;

    public CampaignController(CampaignService campaignService, UserRepository userRepository) {
        this.campaignService = campaignService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{campaignCode}/qr")
    public ResponseEntity<?> getQrCode(@PathVariable String campaignCode, @RequestParam String studentId) {
        String formattedId = studentId.trim().toUpperCase();
        
        System.out.println(">>> Request QR for Student ID: [" + formattedId + "]");
        System.out.println(">>> Length: " + formattedId.length());
        for (char c : formattedId.toCharArray()) {
            System.out.print((int)c + " ");
        }
        System.out.println();
        
        java.util.Optional<com.itmc.payment_service.entity.User> userOpt = userRepository.findByStudentId(formattedId);
        System.out.println(">>> Found user in DB: " + userOpt.isPresent());
        
        if (!userOpt.isPresent()) {
            // Log 5 users from DB to see what they look like
            System.out.println(">>> Let's check some users in DB:");
            userRepository.findAll().stream().limit(5).forEach(u -> {
                System.out.println("DB User: [" + u.getStudentId() + "] length: " + u.getStudentId().length());
                for (char c : u.getStudentId().toCharArray()) {
                    System.out.print((int)c + " ");
                }
                System.out.println();
            });
        }

        // Validate: Kiểm tra MSSV có tồn tại trong hệ thống không
        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "MSSV không tồn tại trong hệ thống",
                    "detail", "Vui lòng liên hệ Admin để được thêm vào danh sách thành viên"
            ));
        }

        QrResponse qr = campaignService.generateQrInfo(campaignCode, formattedId);
        return ResponseEntity.ok(qr);
    }
}
