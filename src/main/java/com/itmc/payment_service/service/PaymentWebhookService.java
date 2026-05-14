package com.itmc.payment_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.itmc.payment_service.dto.PayOSWebhookRequest;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.TransactionStatus;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;

import java.math.BigDecimal;
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
    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile("(?i)[B|N]\\d{2}[A-Z]{4}\\d{3}");

    public PaymentWebhookService(StringRedisTemplate redisTemplate, UserRepository userRepository,
                                 CampaignRepository campaignRepository, TransactionRepository transactionRepository) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public void processWebhookData(PayOSWebhookRequest.WebhookData data) {
        String reference = data.getReference();
        String redisKey = REDIS_PREFIX + reference;
        
        // Idempotency check
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(redisKey, "PROCESSED", Duration.ofDays(30));
        if (Boolean.FALSE.equals(isNew)) {
            log.warn("Duplicate transaction ignored: {}", reference);
            return;
        }

        try {
            String studentId = extractStudentId(data.getDescription());
            if (studentId == null) {
                log.warn("Could not resolve Student ID from description: {}", data.getDescription());
                return;
            }

            // For club fund, we usually have a default campaign. Let's assume CAMP01.
            Campaign campaign = campaignRepository.findByCampaignCode("CAMP01")
                    .orElseThrow(() -> new RuntimeException("Default campaign CAMP01 not found"));

            // Find or create user
            User user = userRepository.findByStudentId(studentId)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setStudentId(studentId);
                        newUser.setEmail(studentId.toLowerCase() + "@student.ptit.edu.vn");
                        return userRepository.save(newUser);
                    });

            BigDecimal amount = BigDecimal.valueOf(data.getAmount());
            TransactionStatus status = amount.compareTo(campaign.getAmountRequired()) >= 0 
                    ? TransactionStatus.SUCCESS : TransactionStatus.PARTIAL;

            Transaction transaction = new Transaction();
            transaction.setUser(user);
            transaction.setCampaign(campaign);
            transaction.setAmountPaid(amount);
            transaction.setTransactionCode(reference);
            transaction.setStatus(status);
            transaction.setCreatedAt(LocalDateTime.now());

            transactionRepository.save(transaction);
            log.info("Payment processed successfully for student {} via PayOS", studentId);

        } catch (Exception e) {
            redisTemplate.delete(redisKey);
            log.error("Failed to process PayOS payment {}: {}", reference, e.getMessage());
            throw e;
        }
    }

    private String extractStudentId(String description) {
        if (description == null) return null;
        Matcher matcher = STUDENT_ID_PATTERN.matcher(description);
        return matcher.find() ? matcher.group().toUpperCase() : null;
    }
}