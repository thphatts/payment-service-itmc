package com.itmc.payment_service.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.itmc.payment_service.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {}
