package com.itmc.payment_service.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinanceSummaryDTO {
    private BigDecimal totalIn;
    private BigDecimal totalOut;
    private BigDecimal balance;
    private List<ExpenseResponseDTO> recentExpenses;

    public FinanceSummaryDTO() {}

    public FinanceSummaryDTO(BigDecimal totalIn, BigDecimal totalOut, BigDecimal balance, List<ExpenseResponseDTO> recentExpenses) {
        this.totalIn = totalIn;
        this.totalOut = totalOut;
        this.balance = balance;
        this.recentExpenses = recentExpenses;
    }

    public BigDecimal getTotalIn() { return totalIn; }
    public void setTotalIn(BigDecimal totalIn) { this.totalIn = totalIn; }

    public BigDecimal getTotalOut() { return totalOut; }
    public void setTotalOut(BigDecimal totalOut) { this.totalOut = totalOut; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public List<ExpenseResponseDTO> getRecentExpenses() { return recentExpenses; }
    public void setRecentExpenses(List<ExpenseResponseDTO> recentExpenses) { this.recentExpenses = recentExpenses; }
}
