package com.itmc.payment_service.scheduler;

import com.itmc.payment_service.dto.QrResponse;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.CampaignStatus;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;
import com.itmc.payment_service.service.CampaignService;
import com.itmc.payment_service.service.EmailService;
import com.itmc.payment_service.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Slf4j
public class CampaignScheduler {

    private final CampaignRepository campaignRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CampaignService campaignService;
    private final EmailService emailService;
    private final NotificationService notificationService;

    public CampaignScheduler(CampaignRepository campaignRepository,
                             UserRepository userRepository,
                             TransactionRepository transactionRepository,
                             CampaignService campaignService,
                             EmailService emailService,
                             NotificationService notificationService) {
        this.campaignRepository = campaignRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.campaignService = campaignService;
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    /**
     * Chạy định kỳ mỗi giờ để kiểm tra và gửi thông báo nhắc nhở / tự động đóng quỹ.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void checkCampaignDeadlines() {
        log.info("CampaignScheduler: Bắt đầu kiểm tra thời hạn đợt quỹ...");
        LocalDateTime now = LocalDateTime.now();
        List<Campaign> openCampaigns = campaignRepository.findAll().stream()
                .filter(c -> c.getStatus() == CampaignStatus.OPEN)
                .collect(Collectors.toList());

        for (Campaign campaign : openCampaigns) {
            if (campaign.getEndDate() == null) continue;

            // 1. NHẮC NHỞ TRƯỚC 1 NGÀY (endDate nằm trong khoảng [now, now + 24 giờ])
            if (campaign.getEndDate().isAfter(now) && campaign.getEndDate().isBefore(now.plusDays(1))) {
                if (!campaign.isReminderSent()) {
                    log.info("CampaignScheduler: Đợt quỹ {} sắp hết hạn trong 24 giờ nữa. Đang gửi nhắc nhở...", campaign.getCampaignCode());
                    sendBulkNotifications(campaign, true);
                    campaign.setReminderSent(true);
                    campaignRepository.save(campaign);
                }
            }
            
            // 2. TỰ ĐỘNG ĐÓNG QUỸ KHI QUÁ HẠN (endDate <= now)
            if (campaign.getEndDate().isBefore(now) || campaign.getEndDate().isEqual(now)) {
                log.info("CampaignScheduler: Đợt quỹ {} đã quá hạn. Đang tự động đóng đợt quỹ...", campaign.getCampaignCode());
                campaign.setStatus(CampaignStatus.CLOSED);
                campaignRepository.save(campaign);
                
                // Gửi thông báo hết hạn cuối cùng
                sendBulkNotifications(campaign, false);
            }
        }
        log.info("CampaignScheduler: Hoàn thành kiểm tra thời hạn.");
    }

    /**
     * Tìm kiếm thành viên chưa đóng quỹ và gửi thông báo hàng loạt (Email + In-app).
     */
    public void sendBulkNotifications(Campaign campaign, boolean isReminder) {
        List<User> allUsers = userRepository.findAll();
        BigDecimal amountRequired = campaign.getAmountRequired();

        // Tính tổng số tiền đã đóng của từng sinh viên trong đợt quỹ này
        List<Transaction> transactions = transactionRepository.findAll().stream()
                .filter(t -> t.getCampaign() != null && 
                             t.getCampaign().getCampaignCode().equalsIgnoreCase(campaign.getCampaignCode()) &&
                             t.getStatus() == com.itmc.payment_service.model.TransactionStatus.SUCCESS)
                .collect(Collectors.toList());

        Map<String, BigDecimal> userPaidAmounts = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getUser().getStudentId(),
                        Collectors.mapping(Transaction::getAmountPaid,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        // Lọc các thành viên chưa đóng đủ
        List<User> unpaidUsers = allUsers.stream()
                .filter(user -> {
                    BigDecimal paid = userPaidAmounts.getOrDefault(user.getStudentId(), BigDecimal.ZERO);
                    return paid.compareTo(amountRequired) < 0;
                })
                .collect(Collectors.toList());

        log.info("CampaignScheduler: Tìm thấy {} thành viên chưa hoàn thành đóng quỹ cho đợt {}", 
                unpaidUsers.size(), campaign.getCampaignCode());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        String formattedEndDate = campaign.getEndDate().format(formatter);

        for (User user : unpaidUsers) {
            try {
                // Tạo mã QR VietQR cá nhân hóa kết nối trực tiếp với PayOS để tự đối soát khi thanh toán
                QrResponse qrInfo = campaignService.generateQrInfo(campaign.getCampaignCode(), user.getStudentId());
                
                String studentMail = user.getEmail() != null ? user.getEmail() : (user.getStudentId().toLowerCase() + "@student.ptithcm.edu.vn");
                String subject = isReminder 
                        ? "[ITMC Remind] Nhắc nhở: Đợt đóng quỹ " + campaign.getTitle() + " sắp hết hạn!" 
                        : "[ITMC Portal] Thông báo: Đợt đóng quỹ " + campaign.getTitle() + " đã chính thức kết thúc!";

                // Tạo email HTML
                String emailHtml = emailService.buildExpirationReminderTemplate(
                        user.getFullName(),
                        user.getStudentId(),
                        campaign.getTitle(),
                        amountRequired.stripTrailingZeros().toPlainString(),
                        formattedEndDate,
                        qrInfo.getQrUrl(),
                        qrInfo.getAccountNo(),
                        qrInfo.getBankId(),
                        qrInfo.getAccountName(),
                        qrInfo.getContent(),
                        isReminder
                );

                // Gửi email bất đồng bộ
                emailService.sendHtmlEmail(studentMail, subject, emailHtml);

                // Tạo thông báo In-app
                String inAppMessage = isReminder
                        ? "Đợt đóng quỹ '" + campaign.getTitle() + "' sắp hết hạn lúc " + formattedEndDate + ". Vui lòng hoàn thành đóng quỹ!"
                        : "Đợt đóng quỹ '" + campaign.getTitle() + "' đã hết hạn đóng và chính thức đóng.";
                String notifyType = isReminder ? "WARNING" : "INFO";
                notificationService.createNotification(user, inAppMessage, notifyType);

            } catch (Exception e) {
                log.error("Lỗi khi gửi thông báo cho sinh viên {}: {}", user.getStudentId(), e.getMessage());
            }
        }
    }
}
