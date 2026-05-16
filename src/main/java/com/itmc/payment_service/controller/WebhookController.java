package com.itmc.payment_service.controller;

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
    public ResponseEntity<?> handleWebhook(@RequestBody vn.payos.type.Webhook payload) {
        System.out.println(">>> Webhook Received: " + payload.toString());
        
        try {
            // Verify signature using PayOS SDK
            vn.payos.type.WebhookData webhookData = payOS.verifyPaymentWebhookData(payload);
            
            if (webhookData != null) {
                com.itmc.payment_service.dto.PaymentWebhookRequest request = new com.itmc.payment_service.dto.PaymentWebhookRequest();
                request.setTransactionContent(webhookData.getDescription());
                request.setAmountIn(new java.math.BigDecimal(webhookData.getAmount()));
                request.setTransactionId(webhookData.getReference());
                
                webhookService.processPayment(request);
                System.out.println(">>> Processed Verified PayOS payment: " + webhookData.getReference());
            }
        } catch (Exception e) {
            System.err.println(">>> Webhook verification failed: " + e.getMessage());
        }
        
        return ResponseEntity.ok().build();
    }
}
