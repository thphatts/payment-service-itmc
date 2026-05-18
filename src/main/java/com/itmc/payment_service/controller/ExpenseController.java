package com.itmc.payment_service.controller;

import com.itmc.payment_service.dto.ExpenseRequestDTO;
import com.itmc.payment_service.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/expenses")
@CrossOrigin(origins = "*")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<?> createExpense(@Valid @RequestBody ExpenseRequestDTO request, Principal principal) {
        if (principal == null) {
            // For testing purposes if security context is not strictly enforced
            return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));
        }
        return ResponseEntity.ok(expenseService.createExpense(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<?> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.ok(Map.of("message", "Expense deleted successfully"));
    }
}
