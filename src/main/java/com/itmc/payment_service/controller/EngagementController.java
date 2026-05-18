package com.itmc.payment_service.controller;

import com.itmc.payment_service.service.EngagementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class EngagementController {

    @Autowired
    private EngagementService engagementService;

    @GetMapping("/admin/engagement/overview")
    public ResponseEntity<?> getEngagementOverview() {
        try {
            return ResponseEntity.ok(engagementService.getEngagementOverview());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping("/finance/my-engagement")
    public ResponseEntity<?> getMyEngagement(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        try {
            return ResponseEntity.ok(engagementService.getMemberEngagement(principal.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
