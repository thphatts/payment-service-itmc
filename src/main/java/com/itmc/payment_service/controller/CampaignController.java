package com.itmc.payment_service.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.itmc.payment_service.dto.QrResponse;
import com.itmc.payment_service.service.CampaignService;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {
    private final CampaignService campaignService;

    public CampaignController(CampaignService campaignService) {
        this.campaignService = campaignService;
    }

    @GetMapping("/{campaignCode}/qr")
    public ResponseEntity<QrResponse> getQrCode(@PathVariable String campaignCode, @RequestParam String studentId) {
        return ResponseEntity.ok(campaignService.generateQrInfo(campaignCode, studentId));
    }
}
