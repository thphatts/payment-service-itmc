package com.itmc.payment_service.controller;

import com.itmc.payment_service.dto.AttendanceSubmitDTO;
import com.itmc.payment_service.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    public ResponseEntity<?> saveAttendance(@RequestBody AttendanceSubmitDTO dto) {
        try {
            attendanceService.saveAttendance(dto);
            return ResponseEntity.ok(Map.of("message", "Lưu điểm danh thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<?> getAttendance(@RequestParam("eventDate") String eventDate) {
        try {
            return ResponseEntity.ok(attendanceService.getAttendanceForEvent(eventDate));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Lỗi: " + e.getMessage()));
        }
    }
}
