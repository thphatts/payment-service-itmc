package com.itmc.payment_service.controller;

import com.itmc.payment_service.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/finance")
@CrossOrigin(origins = "*")
public class FinanceController {

    @Autowired
    private ExpenseService expenseService;

    @GetMapping("/summary")
    public ResponseEntity<?> getFinanceSummary() {
        return ResponseEntity.ok(expenseService.getFinanceSummary());
    }
}
