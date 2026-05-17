package com.itmc.payment_service.service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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

import lombok.extern.slf4j.Slf4j;

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

    private final NotificationService notificationService;

    public PaymentWebhookService(StringRedisTemplate redisTemplate, UserRepository userRepository,
                                 CampaignRepository campaignRepository, TransactionRepository transactionRepository,
                                 NotificationService notificationService) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.campaignRepository = campaignRepository;
        this.transactionRepository = transactionRepository;
        this.notificationService = notificationService;
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
            // Lấy trực tiếp orderCode từ request (đã được parse từ PayOS WebhookData)
            String orderCodeStr = String.valueOf(request.getOrderCode());
            
            if (request.getOrderCode() == null || request.getOrderCode() == 0) {
                throw new RuntimeException("Không tìm thấy orderCode trong webhook data!");
            }

            // Tra cứu Redis để lấy studentId và campaignCode
            String mappingKey = "PAYOS_ORDER:" + orderCodeStr;
            String mappingValue = redisTemplate.opsForValue().get(mappingKey);
            
            if (mappingValue == null) {
                throw new RuntimeException("Không tìm thấy thông tin giao dịch cho orderCode: " + orderCodeStr);
            }

            String[] parts = mappingValue.split(":");
            String studentId = parts[0];
            String campaignCode = parts[1];

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
            
            if (status == TransactionStatus.SUCCESS) {
                notificationService.createNotification(user, 
                    "Thanh toán thành công cho quỹ: " + campaign.getTitle() + ". Số tiền: " + request.getAmountIn() + " VNĐ", 
                    "SUCCESS");
            } else {
                notificationService.createNotification(user, 
                    "Thanh toán ghi nhận một phần cho quỹ: " + campaign.getTitle() + ". Số tiền: " + request.getAmountIn() + " VNĐ", 
                    "INFO");
            }

            log.info("Payment processed: user={}, campaign={}, amount={}, status={}",
                    studentId, campaignCode, request.getAmountIn(), status);

        } catch (RuntimeException e) {
            redisTemplate.delete(redisKey); // Rollback idempotency key
            log.error("Failed to process payment {}: {}", request.getTransactionId(), e.getMessage());
            throw e;
        }
    }
}