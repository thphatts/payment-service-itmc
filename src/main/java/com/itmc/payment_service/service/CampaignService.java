package com.itmc.payment_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;
import com.itmc.payment_service.dto.QrResponse;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.repository.CampaignRepository;
import vn.payos.PayOS;

import org.springframework.data.redis.core.StringRedisTemplate;
import java.nio.charset.StandardCharsets;
import java.math.BigDecimal;
import java.time.Duration;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final PayOS payOS;
    private final StringRedisTemplate redisTemplate;

    @Value("${app.bank.id}") private String bankId;
    @Value("${app.bank.account-no}") private String accountNo;
    @Value("${app.bank.account-name}") private String accountName;

    public CampaignService(CampaignRepository campaignRepository, PayOS payOS, StringRedisTemplate redisTemplate) {
        this.campaignRepository = campaignRepository;
        this.payOS = payOS;
        this.redisTemplate = redisTemplate;
    }

    public QrResponse generateQrInfo(String campaignCode, String studentId) {
        Campaign campaign = campaignRepository.findByCampaignCode(campaignCode)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        try {
            // Generate a unique order code for PayOS
            long orderCode = Long.parseLong(String.valueOf(System.currentTimeMillis()).substring(3) + (int)(Math.random() * 100));

            // Save mapping to Redis so we know who paid when the webhook arrives
            String mappingValue = studentId + ":" + campaignCode;
            redisTemplate.opsForValue().set("PAYOS_ORDER:" + orderCode, mappingValue, Duration.ofDays(7));

            vn.payos.model.v2.paymentRequests.PaymentLinkItem item = vn.payos.model.v2.paymentRequests.PaymentLinkItem.builder()
                .name(campaign.getTitle() != null ? campaign.getTitle() : "Quy CLB")
                .price((long) campaign.getAmountRequired().intValue())
                .quantity(1)
                .build();

            vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest paymentData = vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest.builder()
                .orderCode(orderCode)
                .description(String.valueOf(orderCode)) // Content must match orderCode for PayOS tracking
                .amount((long) campaign.getAmountRequired().intValue())
                .items(java.util.List.of(item))
                .returnUrl("http://localhost:3000") // Dummy url
                .cancelUrl("http://localhost:3000") // Dummy url
                .build();

            // Register transaction with PayOS
            vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse data = payOS.paymentRequests().create(paymentData);

            // Use the exact description returned by PayOS (which might include prefixes required by PayOS)
            String expectedDescription = data.getDescription() != null ? data.getDescription() : String.valueOf(orderCode);
            String payosBankId = data.getBin() != null ? data.getBin() : bankId;
            String payosAccountNo = data.getAccountNumber() != null ? data.getAccountNumber() : accountNo;
            String payosAccountName = data.getAccountName() != null ? data.getAccountName() : accountName;

            // Generate VietQR Image URL with the exact details expected by PayOS
            String encodedContent = UriUtils.encode(expectedDescription, StandardCharsets.UTF_8);
            String encodedName = UriUtils.encode(payosAccountName, StandardCharsets.UTF_8);
            String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                    payosBankId, payosAccountNo, campaign.getAmountRequired().toPlainString(), encodedContent, encodedName);

            QrResponse response = new QrResponse();
            // If PayOS provides a QR code directly, we can use it, but fallback to VietQR
            response.setQrUrl(qrUrl); // Do not use data.getQrCode() as it returns the raw TLV string, not an image URL
            response.setAccountNo(payosAccountNo);
            response.setBankId(payosBankId);
            response.setAccountName(payosAccountName);
            response.setContent(expectedDescription); // VERY IMPORTANT: Use the exact description PayOS expects
            response.setAmount(campaign.getAmountRequired());
            
            return response;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi tạo PayOS Link: " + e.getMessage());
        }
    }
}