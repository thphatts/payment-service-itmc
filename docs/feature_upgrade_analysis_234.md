# Phân tích Chuyên sâu Kế hoạch Nâng cấp (Hướng 2, 3, 4)

Tài liệu này phân tích chi tiết về kiến trúc dữ liệu, luồng nghiệp vụ và công nghệ cần áp dụng để triển khai 3 hướng nâng cấp trọng tâm: Quản lý Sự kiện (2), Quản lý Chi tiêu (3) và Phân tích Dữ liệu (4).

---

## 2. Quản lý Sự kiện & QR Code Check-in (Event Management)

### Mục tiêu
Chuyển đổi từ việc "điểm danh thủ công theo ngày" sang "quản lý theo sự kiện", kết hợp quét mã QR để điểm danh nhanh với số lượng lớn sinh viên.

### Thiết kế Cơ sở dữ liệu (Database)
Cần tạo thêm các Entity mới:
1. **`Event`**: Quản lý thông tin sự kiện.
   - Các trường: `id`, `name`, `description`, `location`, `startTime`, `endTime`, `capacity` (số lượng tối đa), `isRequired` (Bắt buộc tham gia hay tự chọn).
2. **`EventRegistration`**: Lưu lịch sử đăng ký tham gia (RSVP).
   - Các trường: `id`, `event_id`, `user_id`, `registrationTime`.
3. **`Attendance` (Cập nhật)**: Thay vì chỉ có ngày tháng, bảng này sẽ liên kết trực tiếp `user_id` với `event_id`. Cập nhật thêm trường `checkInTime`.

### Cấu trúc Mã QR
- Không nên chỉ dùng `studentId` làm mã QR vì dễ bị làm giả (sinh viên có thể tạo QR hộ nhau). 
- **Giải pháp:** Trong bảng `User`, thêm trường `qrToken` (UUID). Khi quét, backend kiểm tra `qrToken` để xác nhận danh tính.

### Triển khai Frontend & Trải nghiệm
- **Profile (Sinh viên):** Tích hợp thư viện `qrcode.react` để tạo mã QR động từ `qrToken` của sinh viên.
- **Event Dashboard:** Sinh viên xem danh sách sự kiện sắp tới và bấm "Đăng ký tham gia".
- **QR Scanner (Admin):** Tích hợp thư viện `@zxing/browser` hoặc `html5-qrcode` trực tiếp trên web (Admin mở bằng điện thoại, cấp quyền Camera) để quét QR tại cửa ra vào. Quét thành công -> Gọi API -> Trả về màn hình Xanh (Thành công) kèm tên sinh viên.

---

## 3. Quản lý Chi tiêu & Quỹ Minh bạch (Expense Tracking)

### Mục tiêu
Đảm bảo dòng tiền được quản lý hai chiều (Thu và Chi). Tự động hóa việc tính toán Số dư (Balance) hiện tại của CLB.

### Thiết kế Cơ sở dữ liệu
1. **`Expense`**: Quản lý các khoản chi ra.
   - Các trường: `id`, `campaign_id` (Tuỳ chọn - Chi tiêu thuộc đợt thu quỹ nào), `amount` (Số tiền chi), `title` (Tên khoản chi), `description`, `expenseDate`, `receiptUrl` (Đường dẫn ảnh hóa đơn/chứng từ), `createdBy_id` (Admin nào đã tạo khoản chi này).

### Logic Backend (Balance Calculation)
- **Tổng Thu (Total In):** SUM(`amountPaid`) từ bảng `Transaction` có `status = 'SUCCESS'`.
- **Tổng Chi (Total Out):** SUM(`amount`) từ bảng `Expense`.
- **Số dư khả dụng (Balance) = Tổng Thu - Tổng Chi.**
- Xây dựng API `GET /api/finance/summary` trả về cụ thể 3 con số này.

### Triển khai Frontend
- **Admin Tab (Expenses):** Giao diện thêm mới khoản chi. Hỗ trợ upload ảnh chứng từ (Có thể lưu trên local server, hoặc cấu hình lưu vào S3/Cloudinary/Imgur API).
- **Transparency Tab (Member):** Sinh viên truy cập trang "Tài chính CLB" để xem Tổng Số Dư hiện tại và danh sách các khoản chi (Được phép che thông tin nhạy cảm, chỉ hiện tên khoản chi và số tiền).

---

## 4. Phân tích Dữ liệu & Báo cáo nâng cao (Analytics & Reporting)

### Mục tiêu
Giúp BĐH nắm bắt sức khỏe của CLB (Tỉ lệ nợ quỹ, Tỉ lệ tham gia hoạt động) bằng các con số và biểu đồ trực quan, đồng thời tự động xuất báo cáo giấy tờ.

### Triển khai Báo cáo Trực quan (Biểu đồ Frontend)
Cần cài đặt thêm thư viện `recharts` hoặc `chart.js` trong React.
1. **Biểu đồ Cột (Bar Chart): Tỉ lệ Điểm danh.**
   - Trục X: Tên các sự kiện.
   - Trục Y: Số lượng tham gia.
   - Cho phép nhìn thấy xu hướng tham gia (tăng/giảm) qua các tuần.
2. **Biểu đồ Tròn (Pie Chart): Tỉ lệ Đóng Quỹ.**
   - Lấy dữ liệu của 1 đợt thu quỹ (Campaign).
   - Phần trăm: Đã hoàn thành (Xanh), Đang nợ (Đỏ).

### Triển khai Export Dữ liệu (Backend)
Vì trong `pom.xml` của bạn **đã có sẵn** thư viện `Apache POI` (`poi-ooxml` bản 5.2.5), việc xuất file Excel là cực kỳ dễ dàng.
- **`GET /api/reports/attendance/{eventId}/export`**: Dùng POI tạo một sheet Excel, đổ danh sách sinh viên Điểm danh Có/Không, tải file `.xlsx` về trình duyệt.
- **`GET /api/reports/funds/{campaignId}/export`**: Xuất danh sách sinh viên nợ quỹ (Mã SV, Tên, Số điện thoại) để ban liên lạc gọi điện trực tiếp.

---

## 🔥 Đề xuất Quy trình Thực hiện (Action Plan)
Nếu bạn muốn bắt đầu làm ngay, mình khuyến nghị đi theo thứ tự sau để dễ làm và mang lại hiệu quả thấy ngay:
1. **Làm Hướng 3 trước (Chi tiêu):** Vì nó sử dụng chung domain với `Payment/Campaign` hiện tại. Thêm bảng `Expense`, làm API lấy Summary và tích hợp Dashboard.
2. **Làm Hướng 4 (Export Excel):** Thư viện đã có sẵn, chỉ cần viết thêm một Service sinh file Excel từ dữ liệu trong DB hiện tại.
3. **Làm Hướng 2 sau cùng (QR Code):** Đây là một luồng lớn, cần làm kỹ phần Web Camera Scanner, mã hóa QR token và refactor lại bảng Attendance.
