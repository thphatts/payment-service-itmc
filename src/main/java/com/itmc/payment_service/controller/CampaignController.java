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

        // Validate: Kiểm tra MSSV có tồn tại trong hệ thống không
        if (userRepository.findByStudentId(formattedId).isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "MSSV không tồn tại trong hệ thống",
                    "detail", "Vui lòng liên hệ Admin để được thêm vào danh sách thành viên"
            ));
        }

        QrResponse qr = campaignService.generateQrInfo(campaignCode, formattedId);
        return ResponseEntity.ok(qr);
    }
}
