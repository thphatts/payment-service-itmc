package com.itmc.payment_service.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.model.TransactionStatus;
import java.math.BigDecimal;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT SUM(t.amountPaid) FROM Transaction t WHERE t.status = :status")
    BigDecimal sumAmountPaidByStatus(@Param("status") TransactionStatus status);

    long countByUserAndStatus(com.itmc.payment_service.entity.User user, TransactionStatus status);
}
