package com.itmc.payment_service.controller;

import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.itmc.payment_service.service.PaymentWebhookService;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {
    private final PaymentWebhookService webhookService;
    private final vn.payos.PayOS payOS;

    public WebhookController(PaymentWebhookService webhookService, vn.payos.PayOS payOS) {
        this.webhookService = webhookService;
        this.payOS = payOS;
    }

    @PostMapping("/payment")
    public ResponseEntity<?> handleWebhook(@RequestBody Map<String, Object> payload) {
        System.out.println(">>> RAW Webhook Received: " + payload);
        
        try {
            // Chuyển đổi Map sang Webhook object của PayOS SDK để verify
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            vn.payos.model.webhooks.Webhook webhookBody = mapper.convertValue(payload, vn.payos.model.webhooks.Webhook.class);
            
            vn.payos.model.webhooks.WebhookData webhookData = payOS.webhooks().verify(webhookBody);
            
            if (webhookData != null) {
                com.itmc.payment_service.dto.PaymentWebhookRequest request = new com.itmc.payment_service.dto.PaymentWebhookRequest();
                request.setTransactionContent(webhookData.getDescription());
                request.setAmountIn(new java.math.BigDecimal(webhookData.getAmount()));
                request.setTransactionId(webhookData.getReference());
                request.setOrderCode(webhookData.getOrderCode());
                
                webhookService.processPayment(request);
                System.out.println(">>> Processed Verified PayOS payment: " + webhookData.getReference());
            }
        } catch (Exception e) {
            System.err.println(">>> Webhook verification failed: " + e.getMessage());
            // In ra stack trace để debug kỹ hơn
            e.printStackTrace();
        }
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    @org.springframework.web.bind.annotation.GetMapping("/payment")
    public ResponseEntity<?> verifyWebhook() {
        System.out.println(">>> Webhook GET Verification received");
        return ResponseEntity.ok(Map.of("status", "active", "message", "Webhook endpoint is ready"));
    }
}

@RestController
class RootController {
    @org.springframework.web.bind.annotation.GetMapping("/")
    public String home() {
        return "ClubSphere Payment Service is running!";
    }
}
