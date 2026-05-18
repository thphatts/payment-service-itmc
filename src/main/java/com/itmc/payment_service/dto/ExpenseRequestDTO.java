package com.itmc.payment_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String category;

    @NotNull(message = "Amount is required")
    private BigDecimal amount;

    @NotNull(message = "Expense date is required")
    private LocalDate expenseDate;

    private String description;

    private String receiptUrl;

    private Long campaignId;

    public ExpenseRequestDTO() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public LocalDate getExpenseDate() { return expenseDate; }
    public void setExpenseDate(LocalDate expenseDate) { this.expenseDate = expenseDate; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReceiptUrl() { return receiptUrl; }
    public void setReceiptUrl(String receiptUrl) { this.receiptUrl = receiptUrl; }

    public Long getCampaignId() { return campaignId; }
    public void setCampaignId(Long campaignId) { this.campaignId = campaignId; }
}
