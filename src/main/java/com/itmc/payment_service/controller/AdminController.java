package com.itmc.payment_service.controller;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.entity.Transaction;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.Role;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;
import com.itmc.payment_service.service.CampaignService;
import com.itmc.payment_service.dto.QrResponse;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/api/v1/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepo;
    private final TransactionRepository transactionRepo;
    private final CampaignRepository campaignRepository;
    private final CampaignService campaignService;
    private final PasswordEncoder passwordEncoder;

    // MSSV: 1 chữ cái đầu (B, N, ...) + 2 số năm + 2-4 ký tự mã ngành + 2-4 số
    // Ví dụ: N23DCCN204, B23DCCN123, N24DCPT006, N23DCAT074
    // MSSV: Linh hoạt hơn cho việc test (ví dụ: SV001, N23DCCN204, ...)
    private static final Pattern STUDENT_ID_PATTERN = Pattern.compile(
            "^[A-Z0-9]{3,15}$", Pattern.CASE_INSENSITIVE);

    public AdminController(UserRepository userRepo, TransactionRepository transactionRepo, 
                           CampaignRepository campaignRepository, CampaignService campaignService,
                           PasswordEncoder passwordEncoder) {
        this.userRepo = userRepo;
        this.transactionRepo = transactionRepo;
        this.campaignRepository = campaignRepository;
        this.campaignService = campaignService;
        this.passwordEncoder = passwordEncoder;
    }

    // ========== 1. XEM TỔNG QUAN THÀNH VIÊN ==========
    @GetMapping("/students/overview")
    public ResponseEntity<List<Map<String, Object>>> getStudentsOverview() {
        List<User> users = userRepo.findAll();
        List<Transaction> transactions = transactionRepo.findAll();

        BigDecimal amountRequired = campaignRepository.findByCampaignCode("CAMP01")
                .map(c -> c.getAmountRequired())
                .orElse(new BigDecimal("100000"));

        // Tổng tiền đã nộp theo từng sinh viên
        Map<String, BigDecimal> userPaidAmounts = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getUser().getStudentId(),
                        Collectors.mapping(Transaction::getAmountPaid,
                                Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        // Ngày nộp gần nhất
        Map<String, LocalDateTime> userLatestDates = transactions.stream()
                .collect(Collectors.toMap(
                        t -> t.getUser().getStudentId(),
                        t -> t.getCreatedAt(),
                        (d1, d2) -> d1.isAfter(d2) ? d1 : d2
                ));

        List<Map<String, Object>> overview = users.stream().map(user -> {
            Map<String, Object> map = new HashMap<>();
            map.put("studentId", user.getStudentId());
            map.put("name", user.getFullName());
            map.put("email", user.getEmail());
            map.put("department", "ITMC");

            BigDecimal paid = userPaidAmounts.getOrDefault(user.getStudentId(), BigDecimal.ZERO);
            LocalDateTime lastDate = userLatestDates.get(user.getStudentId());

            map.put("amount", paid);
            map.put("status", paid.compareTo(amountRequired) >= 0 ? "PAID" : "UNPAID");
            map.put("date", lastDate != null ? lastDate.toString() : null);

            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(overview);
    }

    // ========== 1b. THỐNG KÊ DASHBOARD ==========
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        long totalMembers = userRepo.count();
        List<Transaction> allTransactions = transactionRepo.findAll();
        
        BigDecimal totalFund = allTransactions.stream()
                .map(Transaction::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Lấy 5 giao dịch gần nhất
        List<Map<String, Object>> recentActivity = allTransactions.stream()
                .sorted((t1, t2) -> t2.getCreatedAt().compareTo(t1.getCreatedAt()))
                .limit(5)
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", t.getUser().getFullName());
                    map.put("studentId", t.getUser().getStudentId());
                    map.put("action", "Đóng quỹ " + t.getCampaign().getCampaignCode());
                    map.put("date", t.getCreatedAt().toString());
                    map.put("amount", t.getAmountPaid());
                    map.put("status", t.getStatus());
                    return map;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", totalMembers);
        stats.put("activeMembers", totalMembers); // Placeholder
        stats.put("totalFund", totalFund);
        stats.put("recentActivity", recentActivity);

        return ResponseEntity.ok(stats);
    }

    // ========== 2. IMPORT TỪ FILE CSV HOẶC EXCEL ==========
    @PostMapping("/users/import")
    public ResponseEntity<Map<String, Object>> importUsers(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "File trống"));
        }

        String filename = file.getOriginalFilename();
        if (filename == null) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Không xác định được tên file"));
        }

        try {
            List<String[]> rows;
            if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
                rows = readExcelFile(file);
            } else if (filename.endsWith(".csv")) {
                rows = readCsvFile(file);
            } else {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Chỉ hỗ trợ file .csv, .xlsx, .xls"));
            }

            List<User> newUsers = new ArrayList<>();
            List<Map<String, String>> errors = new ArrayList<>();
            int duplicateCount = 0;

            for (int i = 0; i < rows.size(); i++) {
                String[] data = rows.get(i);
                int rowNum = i + 3; // +3 vì: dòng tiêu đề bảng (1) + header (2) + index từ 0 (1)

                // ====== TỰ ĐỘNG PHÁT HIỆN CỘT ======
                // Format file Excel của CLB: STT | Họ tên | MSSV | Mail | Ban | Quỹ
                // Format file CSV đơn giản:  MSSV | Họ tên | Email
                String studentId = "";
                String fullName = "";
                String email = "";

                if (data.length >= 5) {
                    // Format Excel CLB: STT(0) | Họ tên(1) | MSSV(2) | Mail(3) | Ban(4)
                    studentId = data[2].trim().toUpperCase();
                    fullName = data[1].trim();
                    email = data[3].trim();
                } else if (data.length >= 3) {
                    // Thử detect: nếu cột 0 giống MSSV -> format CSV đơn giản
                    if (STUDENT_ID_PATTERN.matcher(data[0].trim()).matches()) {
                        studentId = data[0].trim().toUpperCase();
                        fullName = data[1].trim();
                        email = data[2].trim();
                    } else {
                        // Có thể là format: STT | Tên | MSSV
                        studentId = data[2].trim().toUpperCase();
                        fullName = data[1].trim();
                    }
                } else if (data.length == 2) {
                    // Chỉ có 2 cột: thử MSSV + Tên hoặc Tên + MSSV
                    if (STUDENT_ID_PATTERN.matcher(data[0].trim()).matches()) {
                        studentId = data[0].trim().toUpperCase();
                        fullName = data[1].trim();
                    } else if (STUDENT_ID_PATTERN.matcher(data[1].trim()).matches()) {
                        studentId = data[1].trim().toUpperCase();
                        fullName = data[0].trim();
                    } else {
                        errors.add(Map.of("row", String.valueOf(rowNum), "reason", "Không tìm thấy MSSV hợp lệ"));
                        continue;
                    }
                } else {
                    errors.add(Map.of("row", String.valueOf(rowNum), "reason", "Thiếu dữ liệu"));
                    continue;
                }

                // Validate MSSV
                if (studentId.isEmpty()) {
                    errors.add(Map.of("row", String.valueOf(rowNum), "reason", "MSSV trống"));
                    continue;
                }
                if (!STUDENT_ID_PATTERN.matcher(studentId).matches()) {
                    errors.add(Map.of("row", String.valueOf(rowNum), "reason",
                            "MSSV không hợp lệ: " + studentId));
                    continue;
                }

                // Validate tên
                if (fullName.isEmpty()) {
                    errors.add(Map.of("row", String.valueOf(rowNum), "reason", "Tên trống cho MSSV: " + studentId));
                    continue;
                }

                // Kiểm tra trùng lặp trong DB
                if (userRepo.findByStudentId(studentId).isPresent()) {
                    duplicateCount++;
                    continue;
                }

                // Kiểm tra trùng lặp trong batch hiện tại
                final String sid = studentId;
                boolean dupInBatch = newUsers.stream().anyMatch(u -> u.getStudentId().equals(sid));
                if (dupInBatch) {
                    duplicateCount++;
                    continue;
                }

                User user = new User();
                user.setStudentId(studentId);
                user.setFullName(fullName);
                user.setEmail(email.isEmpty() ? null : email);
                user.setRole(Role.MEMBER);
                user.setPassword(passwordEncoder.encode(studentId)); // Default password is MSSV
                newUsers.add(user);
            }

            if (!newUsers.isEmpty()) {
                userRepo.saveAll(newUsers);
            }

            Map<String, Object> result = new HashMap<>();
            result.put("success", true);
            result.put("imported", newUsers.size());
            result.put("duplicates", duplicateCount);
            result.put("errors", errors);
            result.put("message", String.format("Import thành công %d thành viên. Bỏ qua %d trùng lặp. %d lỗi.",
                    newUsers.size(), duplicateCount, errors.size()));

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Lỗi khi đọc file: " + e.getMessage()
            ));
        }
    }

    // ========== 3. XÁC NHẬN THANH TOÁN THỦ CÔNG ==========
    @PostMapping("/students/confirm-payment")
    public ResponseEntity<Map<String, Object>> confirmPayment(@RequestParam String studentId) {
        User user = userRepo.findByStudentId(studentId.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        
        com.itmc.payment_service.entity.Campaign campaign = campaignRepository.findByCampaignCode("CAMP01")
                .orElseThrow(() -> new RuntimeException("Chiến dịch CAMP01 chưa được tạo"));

        // Tạo một giao dịch giả lập để ghi nhận đã nộp
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCampaign(campaign);
        transaction.setAmountPaid(campaign.getAmountRequired());
        transaction.setTransactionCode("MANUAL_" + System.currentTimeMillis());
        transaction.setStatus(com.itmc.payment_service.model.TransactionStatus.SUCCESS);
        transaction.setCreatedAt(LocalDateTime.now());

        transactionRepo.save(transaction);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xác nhận thanh toán cho " + user.getFullName()));
    }

    // ========== 3b. XÓA SINH VIÊN ==========
    @org.springframework.web.bind.annotation.DeleteMapping("/users/{studentId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String studentId) {
        User user = userRepo.findByStudentId(studentId.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));

        // Xóa các giao dịch liên quan trước (Cascade)
        List<Transaction> userTransactions = transactionRepo.findAll().stream()
                .filter(t -> t.getUser().getStudentId().equals(user.getStudentId()))
                .collect(Collectors.toList());
        transactionRepo.deleteAll(userTransactions);

        // Xóa sinh viên
        userRepo.delete(user);

        return ResponseEntity.ok(Map.of("success", true, "message", "Đã xóa sinh viên " + studentId));
    }

    // ========== 4. TẠO QR TÙY CHỈNH (Đã xóa để đồng bộ với PayOS) ==========

    // ========== 5. QUẢN LÝ THÔNG TIN QUỸ ==========
    @GetMapping("/campaign/{code}")
    public ResponseEntity<?> getCampaign(@PathVariable String code) {
        return campaignRepository.findByCampaignCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/campaign/{code}")
    public ResponseEntity<?> updateCampaign(@PathVariable String code, @RequestBody Map<String, Object> updates) {
        Campaign campaign = campaignRepository.findByCampaignCode(code)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        
        if (updates.containsKey("title")) campaign.setTitle((String) updates.get("title"));
        if (updates.containsKey("description")) campaign.setDescription((String) updates.get("description"));
        if (updates.containsKey("amountRequired")) {
            Object amt = updates.get("amountRequired");
            if (amt instanceof Integer i) {
                campaign.setAmountRequired(new BigDecimal(i));
            } else if (amt instanceof Double d) {
                campaign.setAmountRequired(BigDecimal.valueOf(d));
            } else if (amt instanceof String s) {
                campaign.setAmountRequired(new BigDecimal(s));
            }
        }
        
        campaignRepository.save(campaign);
        return ResponseEntity.ok(Map.of("message", "Đã cập nhật thông tin quỹ", "campaign", campaign));
    }

    // ========== HELPER: Đọc file CSV ==========
    private List<String[]> readCsvFile(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean isFirstLine = true;
            while ((line = reader.readLine()) != null) {
                if (isFirstLine) { isFirstLine = false; continue; } // Bỏ header
                if (line.trim().isEmpty()) continue; // Bỏ dòng trống
                String[] data = line.split(",");
                rows.add(data);
            }
        }
        return rows;
    }

    // ========== HELPER: Đọc file Excel (.xlsx / .xls) ==========
    private List<String[]> readExcelFile(MultipartFile file) throws Exception {
        List<String[]> rows = new ArrayList<>();
        // Sử dụng WorkbookFactory để hỗ trợ cả .xls và .xlsx
        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            
            for (Row row : sheet) {
                int cellCount = row.getLastCellNum();
                if (cellCount <= 0) continue;

                String[] data = new String[cellCount];
                boolean hasContent = false;
                for (int i = 0; i < cellCount; i++) {
                    Cell cell = row.getCell(i, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
                    data[i] = getCellStringValue(cell);
                    if (!data[i].isEmpty()) hasContent = true;
                }

                // Kiểm tra xem dòng này có phải là header không (Ví dụ: chứa chữ "STT", "Họ tên", "MSSV")
                boolean isHeader = false;
                for (String val : data) {
                    String v = val.toLowerCase();
                    if (v.contains("stt") || v.contains("họ tên") || v.contains("mssv") || v.contains("email")) {
                        isHeader = true;
                        break;
                    }
                }

                if (hasContent && !isHeader) {
                    rows.add(data);
                }
            }
        }
        return rows;
    }

    // ========== HELPER: Đọc giá trị cell Excel an toàn ==========
    private String getCellStringValue(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:  return cell.getStringCellValue().trim();
            case NUMERIC:
                double val = cell.getNumericCellValue();
                if (val == Math.floor(val)) {
                    return String.valueOf((long) val); // Tránh trả về "1.0" cho số nguyên
                }
                return String.valueOf(val);
            case BOOLEAN: return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try { return cell.getStringCellValue().trim(); }
                catch (Exception e) { return String.valueOf(cell.getNumericCellValue()); }
            default:      return "";
        }
    }
}