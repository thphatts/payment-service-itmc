package com.itmc.payment_service.dto;

import java.math.BigDecimal;

public class PaymentWebhookRequest {
    private String transactionId;
    private BigDecimal amountIn;
    private String transactionContent;

    public PaymentWebhookRequest() {}

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public BigDecimal getAmountIn() { return amountIn; }
    public void setAmountIn(BigDecimal amountIn) { this.amountIn = amountIn; }

    public String getTransactionContent() { return transactionContent; }
    public void setTransactionContent(String transactionContent) { this.transactionContent = transactionContent; }
}
