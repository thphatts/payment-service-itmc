package com.itmc.payment_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail, "CLB ITMC Portal");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    public String buildExpirationReminderTemplate(
            String fullName, 
            String studentId, 
            String campaignTitle, 
            String amountRequired, 
            String endDateString, 
            String qrUrl, 
            String accountNo, 
            String bankId, 
            String accountName, 
            String content,
            boolean isLastDay) {
        
        String phaseText = isLastDay ? "SẮP HẾT HẠN (CÒN 1 NGÀY)" : "ĐÃ QUÁ HẠN ĐÓNG QUỸ";
        String colorTheme = isLastDay ? "#fe9d00" : "#d9534f"; // Orange for reminder, Red for expiration
        String headerBg = isLastDay ? "linear-gradient(135deg, #1e293b 0%, #334155 100%)" : "linear-gradient(135deg, #111827 0%, #1f2937 100%)";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "  <meta charset='utf-8'>" +
                "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "  <title>Thông báo đóng quỹ CLB ITMC</title>" +
                "  <style>" +
                "    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }" +
                "    .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0; }" +
                "    .header { background: " + headerBg + "; color: #ffffff; padding: 32px 24px; text-align: center; position: relative; }" +
                "    .header h2 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }" +
                "    .badge { display: inline-block; padding: 6px 12px; border-radius: 9999px; background-color: " + colorTheme + "; color: #ffffff; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-top: 10px; letter-spacing: 0.5px; }" +
                "    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }" +
                "    .greeting { font-size: 18px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }" +
                "    .highlight-box { background-color: #f1f5f9; border-left: 4px solid " + colorTheme + "; padding: 16px; border-radius: 0 8px 8px 0; margin-bottom: 24px; }" +
                "    .highlight-item { display: flex; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 8px; }" +
                "    .highlight-item:last-child { margin-bottom: 0; border-bottom: none; padding-bottom: 0; }" +
                "    .highlight-label { font-weight: 600; color: #475569; }" +
                "    .highlight-value { font-weight: 700; color: #0f172a; }" +
                "    .qr-section { text-align: center; margin: 32px 0; padding: 24px; background-color: #f8fafc; border-radius: 12px; border: 1px dashed #cbd5e1; }" +
                "    .qr-image { max-width: 220px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); }" +
                "    .qr-title { font-weight: 700; margin-top: 12px; font-size: 16px; color: #0f172a; }" +
                "    .qr-desc { font-size: 13px; color: #64748b; margin-top: 4px; }" +
                "    .action-btn { display: block; text-align: center; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; margin-top: 24px; transition: background-color 0.2s; }" +
                "    .footer { background-color: #f8fafc; padding: 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }" +
                "    .footer p { margin: 4px 0; }" +
                "  </style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h2>CÂU LẠC BỘ ITMC</h2>" +
                "      <span class='badge'>" + phaseText + "</span>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <div class='greeting'>Chào bạn " + fullName + " (" + studentId + "),</div>" +
                "      <p>Ban tài chính CLB ITMC xin thông báo về đợt đóng quỹ hoạt động của bạn. Dưới đây là thông tin chi tiết đợt đóng quỹ hiện tại:</p>" +
                "      " +
                "      <div class='highlight-box'>" +
                "        <div class='highlight-item'>" +
                "          <span class='highlight-label'>Tên đợt quỹ:</span>" +
                "          <span class='highlight-value'>" + campaignTitle + "</span>" +
                "        </div>" +
                "        <div class='highlight-item'>" +
                "          <span class='highlight-label'>Số tiền cần nộp:</span>" +
                "          <span class='highlight-value'>" + amountRequired + " VNĐ</span>" +
                "        </div>" +
                "        <div class='highlight-item'>" +
                "          <span class='highlight-label'>Hạn chót đóng:</span>" +
                "          <span class='highlight-value' style='color: " + colorTheme + ";'>" + endDateString + "</span>" +
                "        </div>" +
                "      </div>" +
                "      " +
                "      <p>Vui lòng thực hiện chuyển khoản bằng cách **quét mã VietQR** bên dưới thông qua ứng dụng ngân hàng của bạn. Mã QR này đã chứa đầy đủ thông tin số tài khoản và nội dung chuyển khoản hợp lệ:</p>" +
                "      " +
                "      <div class='qr-section'>" +
                "        <img class='qr-image' src='" + qrUrl + "' alt='VietQR Code' />" +
                "        <div class='qr-title'>Mã QR Chuyển Khoản Nhanh</div>" +
                "        <div class='qr-desc'>Mở ứng dụng Mobile Banking quét ảnh này để tự động điền thông tin</div>" +
                "      </div>" +
                "      " +
                "      <p><strong>Thông tin chuyển khoản thủ công nếu không quét được QR:</strong></p>" +
                "      <ul style='padding-left: 20px; margin-bottom: 24px; font-size: 14px;'>" +
                "        <li><strong>Ngân hàng:</strong> " + bankId + "</li>" +
                "        <li><strong>Số tài khoản:</strong> " + accountNo + "</li>" +
                "        <li><strong>Tên tài khoản:</strong> " + accountName + "</li>" +
                "        <li><strong>Số tiền:</strong> " + amountRequired + " VNĐ</li>" +
                "        <li><strong>Nội dung chuyển khoản:</strong> <code style='background-color: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-family: monospace;'>" + content + "</code></li>" +
                "      </ul>" +
                "      " +
                "      <p style='color: #64748b; font-size: 13px; font-style: italic;'>" +
                "        *Lưu ý: Hệ thống đối soát tự động của chúng tôi sử dụng công nghệ PayOS. Bạn phải chuyển khoản chính xác số tiền và nội dung chuyển khoản để giao dịch được ghi nhận tự động ngay lập tức." +
                "      </p>" +
                "    </div>" +
                "    <div class='footer'>" +
                "      <p><strong>CÂU LẠC BỘ CÔNG NGHỆ THÔNG TIN & TRUYỀN THÔNG ITMC</strong></p>" +
                "      <p>Học viện Công nghệ Bưu chính Viễn thông - Cơ sở TP. Hồ Chí Minh</p>" +
                "      <p>Email liên hệ: itmc.ptithcm@gmail.com | Portal: clb-itmc.web.app</p>" +
                "    </div>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
