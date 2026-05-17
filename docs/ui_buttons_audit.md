# BÁO CÁO KIỂM TRA (AUDIT) CÁC NÚT CHỨC NĂNG CHƯA CÓ CODE GẮN VÀO

Dưới đây là danh sách chi tiết các nút bấm (buttons), ô nhập liệu (inputs) và liên kết (links) trên giao diện người dùng (frontend React) hiện đang hiển thị nhưng chưa được gắn sự kiện (`onClick`, `onChange`, v.v.) hoặc chưa có logic xử lý ở backend/frontend.

---

## 1. Giao diện Khung chính — [Layout.jsx](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Layout.jsx)

### 📌 Nút "New Event" (Tạo Sự Kiện Mới)
* **Vị trí:** [Layout.jsx (Dòng 53-56)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Layout.jsx#L53-L56)
* **Hiện trạng:** Nút kêu gọi hành động (CTA) ở cột bên trái (Sidebar) dành cho quyền `ADMIN` đang trống sự kiện click.
* **Đoạn code:**
  ```jsx
  <button className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary hover:bg-surface-tint hover:shadow-md transition-all duration-200 py-2.5 rounded-lg text-label-md font-label-md">
    <span className="material-symbols-outlined text-[18px]">add</span>
    New Event
  </button>
  ```
* **Khuyến nghị:** Gắn `onClick` để điều hướng tới trang tạo sự kiện (ví dụ: `/events/new` hoặc mở một Modal tạo sự kiện nhanh).

### 📌 Nút "Mobile Menu" (Menu thu gọn trên di động)
* **Vị trí:** [Layout.jsx (Dòng 179-181)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Layout.jsx#L179-L181)
* **Hiện trạng:** Biểu tượng hamburger hiển thị trên màn hình nhỏ di động chưa hoạt động, do đó không thể đóng/mở Sidebar trên điện thoại.
* **Đoạn code:**
  ```jsx
  <button className="md:hidden text-on-surface-variant p-2 rounded-lg hover:bg-surface-container">
    <span className="material-symbols-outlined">menu</span>
  </button>
  ```
* **Khuyến nghị:** Cần thêm state `isMobileMenuOpen` trong `Layout.jsx` và dùng `onClick` để chuyển trạng thái mở/đóng Sidebar trên màn hình mobile.

### 📌 Nút "Notifications" (Chuông thông báo)
* **Vị trí:** [Layout.jsx (Dòng 185-188)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Layout.jsx#L185-L188)
* **Hiện trạng:** Nút hình chuông báo hiệu có dấu tròn đỏ thông báo nhưng click vào không phản hồi.
* **Đoạn code:**
  ```jsx
  <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-all relative">
    <span className="material-symbols-outlined">notifications</span>
    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
  </button>
  ```
* **Khuyến nghị:** Thêm logic mở bảng thông báo Popover (Dropdown) chứa các thông báo biến động số dư hoặc trạng thái điểm danh.

### 📌 Nút "+ New" (Thêm mới nhanh)
* **Vị trí:** [Layout.jsx (Dòng 191-194)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Layout.jsx#L191-L194)
* **Hiện trạng:** Nút bấm nhanh nằm bên cạnh Avatar góc phải trên Header.
* **Đoạn code:**
  ```jsx
  <button className="hidden sm:flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary-fixed-dim px-3 py-1.5 rounded-lg transition-all text-label-sm font-label-sm font-bold">
    <span className="material-symbols-outlined text-[16px]">add</span>
    + New
  </button>
  ```
* **Khuyến nghị:** Tương tự nút "New Event", nên liên kết đến chức năng tạo nhanh chiến dịch thu quỹ hoặc thành viên mới.

---

## 2. Giao diện Điểm danh — [Attendance.jsx](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Attendance.jsx)

### 📌 Nút "Lưu điểm danh" (Save Attendance)
* **Vị trí:** [Attendance.jsx (Dòng 74-77)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Attendance.jsx#L74-L77)
* **Hiện trạng:** Đây là nút **quan trọng nhất** trên trang điểm danh dùng để gửi dữ liệu về máy chủ, nhưng hiện tại chỉ có UI tĩnh chứ chưa được gán bất cứ hàm xử lý nào.
* **Đoạn code:**
  ```jsx
  <button className="bg-primary text-on-primary hover:bg-surface-tint px-6 py-2.5 rounded-lg text-label-md font-label-md transition-all shadow-sm active:scale-95 flex items-center gap-2">
    <span className="material-symbols-outlined text-[20px]">save</span>
    Lưu điểm danh
  </button>
  ```
* **Khuyến nghị:** Tạo hàm `handleSaveAttendance` để gửi dữ liệu từ state `attendanceData` lên backend (API lưu thông tin điểm danh của sinh viên).

### 📌 Ô tìm kiếm "Tìm kiếm hội viên..." (Search input)
* **Vị trí:** [Attendance.jsx (Dòng 88-92)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Attendance.jsx#L88-L92)
* **Hiện trạng:** Ô tìm kiếm tĩnh, chưa được kết nối với State của React nên khi gõ vào sẽ không lọc danh sách hội viên.
* **Đoạn code:**
  ```jsx
  <input 
    className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 pl-10 pr-4 text-body-sm text-on-surface focus:ring-1 focus:ring-primary outline-none" 
    placeholder="Tìm kiếm hội viên..." 
    type="text"
  />
  ```
* **Khuyến nghị:** 
  1. Thêm một state `const [searchTerm, setSearchTerm] = useState('');`
  2. Gắn `value={searchTerm}` và `onChange={(e) => setSearchTerm(e.target.value)}`.
  3. Lọc danh sách `members` dựa trên `searchTerm` trước khi render ra màn hình.

---

## 3. Giao diện Quản lý Thành viên — [Members.jsx](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Members.jsx)

### 📌 Nút "+ Thêm thủ công" (Add Manually)
* **Vị trí:** [Members.jsx (Dòng 105-108)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Members.jsx#L105-L108)
* **Hiện trạng:** Nút thêm thành viên từng người bằng tay chưa hoạt động (trong khi nút Import Excel đã có code xử lý qua hàm `handleImport`).
* **Đoạn code:**
  ```jsx
  <button className="bg-primary text-on-primary px-5 py-2.5 rounded-lg font-label-md hover:bg-surface-tint transition-all shadow-sm flex items-center gap-2">
    <span className="material-symbols-outlined text-sm">person_add</span>
    + Thêm thủ công
  </button>
  ```
* **Khuyến nghị:** Tạo một Modal Form điền thông tin (MSSV, Họ tên, Email) và gửi dữ liệu lên endpoint tạo sinh viên ở Backend.

### 📌 Nút "Sửa" (Edit icon button) trong dòng bảng thành viên
* **Vị trí:** [Members.jsx (Dòng 183-185)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Members.jsx#L183-L185)
* **Hiện trạng:** Biểu tượng cây bút chỉnh sửa thông tin thành viên chưa được gán bất cứ sự kiện nào (nút xóa kế bên đã hoạt động tốt thông qua hàm `handleDelete`).
* **Đoạn code:**
  ```jsx
  <button className="p-1.5 text-on-surface-variant hover:text-primary rounded-md transition-colors">
    <span className="material-symbols-outlined text-[20px]">edit</span>
  </button>
  ```
* **Khuyến nghị:** Thêm `onClick={() => handleEdit(member)}` để mở Modal chỉnh sửa thông tin cá nhân của hội viên tương ứng.

---

## 4. Giao diện Đăng nhập — [Login.jsx](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Login.jsx)

### 📌 Liên kết "QUÊN MẬT KHẨU?"
* **Vị trí:** [Login.jsx (Dòng 156)](file:///Users/nguyenthanhdat/Documents/project/payment-service-itmc/clubsphere-frontend/src/pages/Login.jsx#L156)
* **Hiện trạng:** Đường dẫn tĩnh (`href="#"`) chưa chuyển đến trang lấy lại mật khẩu hoặc liên hệ quản trị viên.
* **Đoạn code:**
  ```jsx
  <a className="text-label-caps font-label-caps text-tech-secondary hover:text-tech-secondary/80 transition-colors" href="#">QUÊN MẬT KHẨU?</a>
  ```
* **Khuyến nghị:** Cập nhật liên kết chuyển đến trang hỗ trợ/phục hồi mật khẩu hoặc hiển thị một thông báo dạng Pop-up hướng dẫn liên hệ Ban quản trị câu lạc bộ.

---

## 💡 Tổng Kết & Đề Xuất Ưu Tiên Thực Hiện
1. **Độ ưu tiên Cao nhất (Critical):**
   * **Nút "Lưu điểm danh"** trong `Attendance.jsx` (Vì không có nút này, chức năng điểm danh hoàn toàn bị vô hiệu hóa).
   * **Ô tìm kiếm hội viên** trong `Attendance.jsx` (Cực kỳ cần thiết để giảng viên/quản trị viên lọc điểm danh nhanh).
2. **Độ ưu tiên Trung bình (High):**
   * **Nút "+ Thêm thủ công"** và **Nút "Edit"** trong `Members.jsx` để quản trị viên có thể quản lý trực tiếp dữ liệu thành viên.
3. **Độ ưu tiên Thấp (Medium):**
   * Hoàn thiện các thành phần phụ trên khung giao diện chính (`Layout.jsx`) như nút **Mobile Menu** (để hỗ trợ sử dụng tốt hơn trên điện thoại), nút **Notifications** và nút **New Event**.
