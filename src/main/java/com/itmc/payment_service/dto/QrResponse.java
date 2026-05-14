package com.itmc.payment_service.dto;

public class QrResponse {
    private String qrUrl;
    private String accountNo;
    private String bankId;
    private String accountName;
    private String content;
    private java.math.BigDecimal amount;

    public QrResponse() {}

    public String getQrUrl() { return qrUrl; }
    public void setQrUrl(String qrUrl) { this.qrUrl = qrUrl; }

    public String getAccountNo() { return accountNo; }
    public void setAccountNo(String accountNo) { this.accountNo = accountNo; }

    public String getBankId() { return bankId; }
    public void setBankId(String bankId) { this.bankId = bankId; }

    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public java.math.BigDecimal getAmount() { return amount; }
    public void setAmount(java.math.BigDecimal amount) { this.amount = amount; }
}