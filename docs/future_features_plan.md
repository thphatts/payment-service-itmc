# Kế hoạch Phát triển Tính năng Tương lai (Roadmap) - ITMC ClubSphere

Dựa trên nền tảng hiện tại của hệ thống (Quản lý thành viên, Thu quỹ tự động qua PayOS, Điểm danh và Phân quyền), dưới đây là lộ trình đề xuất các chức năng nên được phát triển tiếp theo để hoàn thiện hệ sinh thái quản lý câu lạc bộ ITMC.

---

## 1. Hệ thống Thông báo Đa kênh (Omnichannel Notifications)
*Hệ thống hiện tại đang phụ thuộc vào việc sinh viên chủ động đăng nhập để xem thông tin.*
- **Email Tự động (Đã lên kế hoạch):** Nhắc nhở đóng quỹ, thông báo tài khoản mới, cấp lại mật khẩu.
- **In-App Notification (Chuông thông báo):** Thêm thanh chuông thông báo trên Header để báo ngay khi có giao dịch thành công, có buổi điểm danh mới, hoặc thông báo chung từ Admin.
- **Tích hợp Zalo/Telegram Bot (Tương lai xa):** Gửi thông báo tự động (vd: webhook từ PayOS bắn thẳng vào group Zalo của Ban điều hành).

## 2. Quản lý Sự kiện & Hoạt động (Event Management)
*Nâng cấp chức năng điểm danh hiện tại thành một quy trình quản lý sự kiện hoàn chỉnh.*
- **Tạo Sự kiện (Event Registration):** Admin có thể tạo sự kiện, giới hạn số lượng tham gia và ngày giờ.
- **Đăng ký tham gia (RSVP):** Sinh viên vào portal để xác nhận tham gia sự kiện.
- **QR Code Check-in:** Sinh viên có một mã QR cá nhân trong Profile. Admin dùng điện thoại quét mã QR để điểm danh nhanh chóng thay vì tick chọn thủ công.

## 3. Quản lý Chi tiêu & Quỹ Minh bạch (Expense Tracking & Transparency)
*Hiện tại hệ thống mới chỉ quản lý "Thu" tiền (Payment).*
- **Quản lý phiếu Chi:** Admin nhập các khoản chi (Mua bánh kẹo, thuê địa điểm, in ấn...) kèm theo hóa đơn chứng từ.
- **Báo cáo số dư (Balance Dashboard):** Hiển thị tổng Quỹ hiện tại (Tổng Thu - Tổng Chi) một cách tự động.
- **Báo cáo Minh bạch cho Sinh viên:** Sinh viên có thể xem được biểu đồ Thu/Chi của CLB (ở dạng tổng quan) để tăng tính minh bạch.

## 4. Phân tích Dữ liệu & Báo cáo nâng cao (Analytics & Reporting)
*Hỗ trợ Ban chủ nhiệm đưa ra quyết định tốt hơn.*
- **Export Dữ liệu (Excel/PDF):** Xuất báo cáo điểm danh theo tháng, danh sách nợ quỹ, báo cáo thu chi.
- **Biểu đồ (Charts):** Thêm thư viện như `Chart.js` hoặc `Recharts` vào Dashboard để vẽ biểu đồ:
  - Tỷ lệ tham gia các buổi sinh hoạt (Tăng/giảm theo tuần).
  - Tỷ lệ đóng quỹ (Đã đóng vs Chưa đóng).

## 5. Gamification (Trò chơi hóa) & Đánh giá Thành viên
*Tạo động lực để sinh viên tham gia CLB tích cực hơn.*
- **Hệ thống Điểm rèn luyện (KPI/Point System):** Điểm danh đúng giờ (+5 điểm), đóng quỹ sớm (+10 điểm), vắng không phép (-5 điểm).
- **Bảng xếp hạng (Leaderboard):** Tuyên dương Top thành viên tích cực nhất tháng.

## 6. Nâng cấp Bảo mật và Trải nghiệm Người dùng (UX & Security)
- **Quên mật khẩu (Forgot Password):** Hoàn thiện luồng OTP qua email để cấp lại mật khẩu.
- **PWA (Progressive Web App):** Cấu hình để portal có thể được "Cài đặt" như một ứng dụng trên màn hình điện thoại (Add to Home Screen) mà không cần đưa lên App Store / Google Play.
- **Dark Mode:** Bổ sung chế độ giao diện tối (Dark Mode) cho frontend.

---
### 📌 Đề xuất Thứ tự Ưu tiên (Phase 1 -> 3)
1. **Phase 1 (Immediate):** Hệ thống Thông báo (Email, Chuông) & Xuất file Excel Báo cáo.
2. **Phase 2 (Mid-term):** Quản lý Sự kiện, QR Code Check-in & Tính năng Quản lý Chi tiêu (Thu/Chi).
3. **Phase 3 (Long-term):** Gamification, Đánh giá thành viên & Tích hợp Bot Zalo/Telegram.
