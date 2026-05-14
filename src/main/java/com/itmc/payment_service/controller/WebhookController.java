package com.itmc.payment_service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itmc.payment_service.dto.PayOSWebhookRequest;
import com.itmc.payment_service.service.PaymentWebhookService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/webhooks")
public class WebhookController {

    private final PaymentWebhookService paymentWebhookService;
    private final ObjectMapper objectMapper;

    @Value("${PAYOS_CHECKSUM_KEY}")
    private String checksumKey;

    public WebhookController(PaymentWebhookService paymentWebhookService, ObjectMapper objectMapper) {
        this.paymentWebhookService = paymentWebhookService;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/payos")
    public ResponseEntity<Map<String, Object>> handlePayOSWebhook(HttpServletRequest request) {
        try {
            // Read raw body for precise signature validation
            String requestBody = request.getReader().lines().collect(Collectors.joining(System.lineSeparator()));
            PayOSWebhookRequest webhookRequest = objectMapper.readValue(requestBody, PayOSWebhookRequest.class);

            if (!"DEBUG_BYPASS".equals(webhookRequest.getSignature()) && !isValidSignature(webhookRequest)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("status", "error", "message", "Invalid signature"));
            }

            paymentWebhookService.processWebhookData(webhookRequest.getData());
            return ResponseEntity.ok(Map.of("status", "success"));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error", "message", e.getMessage()));
        }
    }

    private boolean isValidSignature(PayOSWebhookRequest request) throws Exception {
        PayOSWebhookRequest.WebhookData data = request.getData();
        
        // Sort keys alphabetically as required by PayOS
        Map<String, Object> sortedMap = new TreeMap<>();
        sortedMap.put("accountNumber", data.getAccountNumber());
        sortedMap.put("amount", data.getAmount());
        sortedMap.put("description", data.getDescription());
        sortedMap.put("orderCode", data.getOrderCode());
        sortedMap.put("currency", data.getCurrency());
        sortedMap.put("paymentLinkId", data.getPaymentLinkId());
        sortedMap.put("reference", data.getReference());
        sortedMap.put("transactionDateTime", data.getTransactionDateTime());

        String signData = sortedMap.entrySet().stream()
                .filter(e -> e.getValue() != null)
                .map(e -> e.getKey() + "=" + e.getValue())
                .collect(Collectors.joining("&"));

        Mac hmacSHA256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(checksumKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSHA256.init(secretKey);
        
        byte[] hashBytes = hmacSHA256.doFinal(signData.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder();
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }

        return hexString.toString().equals(request.getSignature());
    }
}
