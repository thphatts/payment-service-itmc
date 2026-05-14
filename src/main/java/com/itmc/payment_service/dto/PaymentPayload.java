package com.itmc.payment_service.dto;

import lombok.Data;
@Data
public class PaymentPayload {
    private String gateway;             // Ngân hàng gửi webhook (VD: MB_BANK)
    private String transactionId;       // Mã giao dịch để check trùng lặp (VD: FT24135ABC123)
    private Long amountIn;              // Số tiền nhận được
    private String transactionContent;  // Nội dung chuyển khoản (VD: QUYCLB B23DCCN123 CAMP01)
    private String referenceNumber;     // Số tham chiếu (nếu có)
    private String createdAt;           // Thời gian tạo giao dịch
}