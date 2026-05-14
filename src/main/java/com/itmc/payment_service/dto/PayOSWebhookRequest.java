package com.itmc.payment_service.dto;

import lombok.Data;

@Data
public class PayOSWebhookRequest {
    private String code;
    private String desc;
    private WebhookData data;
    private String signature;

    @Data
    public static class WebhookData {
        private int orderCode;
        private int amount;
        private String description;
        private String accountNumber;
        private String reference;
        private String transactionDateTime;
        private String currency;
        private String paymentLinkId;
    }
}
