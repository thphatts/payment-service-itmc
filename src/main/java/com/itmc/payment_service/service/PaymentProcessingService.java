package com.itmc.payment_service.service;

import com.itmc.payment_service.dto.PaymentPayload;
import com.itmc.payment_service.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;

@Service
public class PaymentProcessingService {

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private TransactionRepository transactionRepository;

    @Transactional
    public void processPaymentWebhook(PaymentPayload payload) {
        String transactionId = payload.getTransactionId();

        // Tạo một Key có tiền tố để dễ quản lý trong Redis
        String redisKey = "PAYMENT_PROCESSED:" + transactionId;

        // 1. Kiểm tra Idempotency bằng Redis SETNX
        // Lưu ID giao dịch vào Redis, tồn tại trong 30 ngày (sau 30 ngày tự xóa để giải phóng RAM)
        Boolean isFirstTime = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, "SUCCESS", Duration.ofDays(30));

        // Nếu isFirstTime == false, nghĩa là mã này đã được lưu vào Redis trước đó -> Trùng lặp!
        if (Boolean.FALSE.equals(isFirstTime)) {
            System.out.println("Giao dịch " + transactionId + " bị trùng lặp. Bỏ qua!");
            return; // Chặn đứng tại đây, không xuống DB nữa
        }

        try {
            System.out.println("Bắt đầu xử lý giao dịch mới: " + transactionId);
        } catch (Exception e) {
            redisTemplate.delete(redisKey);
            throw e;
        }
    }
}
