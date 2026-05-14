package com.itmc.payment_service.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.itmc.payment_service.dto.PaymentWebhookRequest;
import com.itmc.payment_service.service.PaymentWebhookService;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {
    private final PaymentWebhookService webhookService;
    
    @Value("${app.webhook.secret}")
    private String secretKey;

    public WebhookController(PaymentWebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/payment")
    public ResponseEntity<String> handlePayment(@RequestHeader("X-Webhook-Secret") String headerSecret,
                                              @RequestBody PaymentWebhookRequest request) {
        if (!secretKey.equals(headerSecret)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Secret");
        }
        
        webhookService.processPayment(request);
        return ResponseEntity.ok("OK");
    }
}
