package com.itmc.payment_service.controller;

import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.service.GoogleSheetsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    private final GoogleSheetsService googleSheetsService;
    private final TransactionRepository transactionRepository;

    public AdminController(GoogleSheetsService googleSheetsService, TransactionRepository transactionRepository) {
        this.googleSheetsService = googleSheetsService;
        this.transactionRepository = transactionRepository;
    }

    @GetMapping("/students/overview")
    public ResponseEntity<List<Map<String, Object>>> getStudentsOverview() {
        // 1. Get all students from Google Sheets
        List<String[]> sheetData = googleSheetsService.getAllStudents();
        
        // 2. Get all successful transactions from DB
        List<Transaction> transactions = transactionRepository.findAll();
        Map<String, Transaction> studentToTransaction = transactions.stream()
                .filter(t -> t.getStatus().toString().equals("SUCCESS"))
                .collect(Collectors.toMap(
                        t -> t.getUser().getStudentId().toUpperCase(),
                        t -> t,
                        (existing, replacement) -> existing // Keep first successful transaction
                ));

        // Use LinkedHashMap to maintain order while de-duplicating
        Map<String, Map<String, Object>> uniqueStudents = new LinkedHashMap<>();
        
        // Skip header row if exists (assuming row 0 is header)
        for (int i = 1; i < sheetData.size(); i++) {
            String[] row = sheetData.get(i);
            if (row.length < 3) continue;

            String studentId = row[2].trim().replaceAll("\"", "").toUpperCase();
            if (studentId.isEmpty()) continue;

            // If duplicate studentId found, skip subsequent ones
            if (uniqueStudents.containsKey(studentId)) continue;

            String name = row[1].trim().replaceAll("\"", "");
            String email = row[3].trim().replaceAll("\"", "");
            String department = row[4].trim().replaceAll("\"", "");

            Map<String, Object> studentInfo = new HashMap<>();
            studentInfo.put("studentId", studentId);
            studentInfo.put("name", name);
            studentInfo.put("email", email);
            studentInfo.put("department", department);
            
            if (studentToTransaction.containsKey(studentId)) {
                studentInfo.put("status", "PAID");
                studentInfo.put("amount", studentToTransaction.get(studentId).getAmountPaid());
                studentInfo.put("date", studentToTransaction.get(studentId).getCreatedAt());
            } else {
                studentInfo.put("status", "UNPAID");
                studentInfo.put("amount", 0);
            }
            
            uniqueStudents.put(studentId, studentInfo);
        }

        return ResponseEntity.ok(new ArrayList<>(uniqueStudents.values()));
    }
}
