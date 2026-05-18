package com.itmc.payment_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.itmc.payment_service.entity.Expense;
import java.math.BigDecimal;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    @Query("SELECT SUM(e.amount) FROM Expense e")
    BigDecimal sumAllExpenses();
}
