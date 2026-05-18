package com.itmc.payment_service.service;

import com.itmc.payment_service.dto.ExpenseRequestDTO;
import com.itmc.payment_service.dto.ExpenseResponseDTO;
import com.itmc.payment_service.dto.FinanceSummaryDTO;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.entity.Expense;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.TransactionStatus;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.ExpenseRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    public ExpenseResponseDTO createExpense(ExpenseRequestDTO request, String userEmail) {
        User admin = userRepository.findByStudentId(userEmail)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Expense expense = new Expense();
        expense.setTitle(request.getTitle());
        expense.setCategory(request.getCategory());
        expense.setAmount(request.getAmount());
        expense.setExpenseDate(request.getExpenseDate());
        expense.setDescription(request.getDescription());
        expense.setReceiptUrl(request.getReceiptUrl());
        expense.setCreatedBy(admin);

        if (request.getCampaignId() != null) {
            Campaign campaign = campaignRepository.findById(request.getCampaignId())
                    .orElseThrow(() -> new RuntimeException("Campaign not found"));
            expense.setCampaign(campaign);
        }

        Expense savedExpense = expenseRepository.save(expense);
        return mapToDTO(savedExpense);
    }

    public List<ExpenseResponseDTO> getAllExpenses() {
        return expenseRepository.findAll(Sort.by(Sort.Direction.DESC, "expenseDate"))
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }

    public FinanceSummaryDTO getFinanceSummary() {
        BigDecimal totalIn = transactionRepository.sumAmountPaidByStatus(TransactionStatus.SUCCESS);
        if (totalIn == null) totalIn = BigDecimal.ZERO;

        BigDecimal totalOut = expenseRepository.sumAllExpenses();
        if (totalOut == null) totalOut = BigDecimal.ZERO;

        BigDecimal balance = totalIn.subtract(totalOut);

        // Get 10 most recent expenses for transparency
        Page<Expense> recentPage = expenseRepository.findAll(
                PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "expenseDate"))
        );

        List<ExpenseResponseDTO> recentExpenses = recentPage.getContent()
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());

        return new FinanceSummaryDTO(totalIn, totalOut, balance, recentExpenses);
    }

    private ExpenseResponseDTO mapToDTO(Expense expense) {
        ExpenseResponseDTO dto = new ExpenseResponseDTO();
        dto.setId(expense.getId());
        dto.setTitle(expense.getTitle());
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setDescription(expense.getDescription());
        dto.setReceiptUrl(expense.getReceiptUrl());
        dto.setCreatedAt(expense.getCreatedAt());

        if (expense.getCampaign() != null) {
            dto.setCampaignId(expense.getCampaign().getId());
        }
        if (expense.getCreatedBy() != null) {
            dto.setCreatedBy(expense.getCreatedBy().getFullName());
        }
        return dto;
    }
}
