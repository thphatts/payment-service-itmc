package com.itmc.payment_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.itmc.payment_service.dto.PaymentWebhookRequest;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.TransactionStatus;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class PaymentWebhookService {
    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final CampaignRepository campaignRepository;
    private final TransactionRepository transactionRepository;

    private static final String REDIS_PREFIX = "PAYMENT_PROCESSED:";
    // Match: QUYCLB <MSSV> <CAMPAIGN_CODE>
    // MSSV: 1 chữ cái (N, B, ...) + 2 số năm + 2-5 ký tự ngành + 2-4 số
    private static final Pattern CONTENT_PATTERN = Pattern.compile(
            "QUYCLB\\s+([A-Z]\\d{2}[A-Z]{2,5}\\d{2,4})\\s+([A-Z0-9]+)",
            Pattern.CASE_INSENSITIVE);

    public PaymentWebhookService(StringRedisTemplate redisTemplate, UserRepository userRepository,
                                 CampaignRepository campaignRepository, TransactionRepository transactionRepository) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void processPayment(PaymentWebhookRequest request) {
        String redisKey = REDIS_PREFIX + request.getTransactionId();
        
        // Idempotency check
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSED", Duration.ofDays(30));
        if (Boolean.FALSE.equals(isNew)) {
            log.warn("Duplicate transaction ignored: {}", request.getTransactionId());
            return;
        }

        try {
            Matcher matcher = CONTENT_PATTERN.matcher(request.getTransactionContent());
            if (!matcher.find()) {
                throw new RuntimeException("Invalid transaction content format: " + request.getTransactionContent());
            }

            String studentId = matcher.group(1).toUpperCase();
            String campaignCode = matcher.group(2).toUpperCase();

            User user = userRepository.findByStudentId(studentId)
                    .orElseThrow(() -> new RuntimeException("User not found: " + studentId));
            Campaign campaign = campaignRepository.findByCampaignCode(campaignCode)
                    .orElseThrow(() -> new RuntimeException("Campaign not found: " + campaignCode));

            TransactionStatus status = request.getAmountIn().compareTo(campaign.getAmountRequired()) >= 0 
                    ? TransactionStatus.SUCCESS : TransactionStatus.PARTIAL;

            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setCampaign(campaign);
            transaction.setAmountPaid(request.getAmountIn());
            transaction.setTransactionCode(request.getTransactionId());
            transaction.setStatus(status);
            transaction.setCreatedAt(LocalDateTime.now());

            transactionRepository.save(transaction);
            log.info("Payment processed: user={}, campaign={}, amount={}, status={}",
                    studentId, campaignCode, request.getAmountIn(), status);

        } catch (RuntimeException e) {
            redisTemplate.delete(redisKey); // Rollback idempotency key
            log.error("Failed to process payment {}: {}", request.getTransactionId(), e.getMessage());
            throw e;
        }
    }
}