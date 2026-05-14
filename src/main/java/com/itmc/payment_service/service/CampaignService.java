package com.itmc.payment_service.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.util.UriUtils;
import com.itmc.payment_service.dto.QrResponse;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.repository.CampaignRepository;
import java.nio.charset.StandardCharsets;

@Service
public class CampaignService {
    private final CampaignRepository campaignRepository;
    private final GoogleSheetsService googleSheetsService;

    @Value("${app.bank.id}") private String bankId;
    @Value("${app.bank.account-no}") private String accountNo;
    @Value("${app.bank.account-name}") private String accountName;

    public CampaignService(CampaignRepository campaignRepository, GoogleSheetsService googleSheetsService) {
        this.campaignRepository = campaignRepository;
        this.googleSheetsService = googleSheetsService;
    }

    public QrResponse generateQrInfo(String campaignCode, String studentId) {
        // 1. Validate student exists in the spreadsheet
        if (!googleSheetsService.isStudentValid(studentId)) {
            throw new RuntimeException("Mã sinh viên không tồn tại trong danh sách đóng quỹ!");
        }

        // 2. Fetch campaign
        Campaign campaign = campaignRepository.findByCampaignCode(campaignCode)
                .orElseThrow(() -> new RuntimeException("Chiến dịch không tồn tại"));

        String content = String.format("QUYCLB %s %s", studentId, campaignCode);
        String encodedContent = UriUtils.encode(content, StandardCharsets.UTF_8);
        String encodedName = UriUtils.encode(accountName, StandardCharsets.UTF_8);

        // VietQR Template
        String qrUrl = String.format("https://img.vietqr.io/image/%s-%s-compact2.png?amount=%s&addInfo=%s&accountName=%s",
                bankId, accountNo, campaign.getAmountRequired().toPlainString(), encodedContent, encodedName);

        QrResponse response = new QrResponse();
        response.setQrUrl(qrUrl);
        response.setAccountNo(accountNo);
        response.setBankId(bankId);
        response.setAccountName(accountName);
        response.setContent(content);
        response.setAmount(campaign.getAmountRequired());
        
        return response;
    }
}