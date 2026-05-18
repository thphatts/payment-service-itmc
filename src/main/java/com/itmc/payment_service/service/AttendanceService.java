package com.itmc.payment_service.service;

import com.itmc.payment_service.dto.AttendanceSubmitDTO;
import com.itmc.payment_service.entity.AttendanceRecord;
import com.itmc.payment_service.entity.Event;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.AttendanceStatus;
import com.itmc.payment_service.repository.AttendanceRecordRepository;
import com.itmc.payment_service.repository.EventRepository;
import com.itmc.payment_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AttendanceService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public void saveAttendance(AttendanceSubmitDTO dto) {
        String eventTitle = dto.getEventDate();
        Event event = eventRepository.findByTitle(eventTitle)
                .orElseGet(() -> {
                    Event newEvent = new Event();
                    newEvent.setTitle(eventTitle);
                    newEvent.setEventDate(parseEventDate(eventTitle));
                    newEvent.setDescription("Tự động tạo từ điểm danh");
                    return eventRepository.save(newEvent);
                });

        Map<String, String> data = dto.getAttendanceData();
        for (Map.Entry<String, String> entry : data.entrySet()) {
            String studentId = entry.getKey();
            String statusStr = entry.getValue().toUpperCase(); // present, late, absent -> PRESENT, LATE, ABSENT
            
            AttendanceStatus status;
            try {
                status = AttendanceStatus.valueOf(statusStr);
            } catch (IllegalArgumentException e) {
                // Map frontend values if they differ
                if (statusStr.equals("PRESENT")) status = AttendanceStatus.PRESENT;
                else if (statusStr.equals("LATE")) status = AttendanceStatus.LATE;
                else status = AttendanceStatus.ABSENT;
            }

            User user = userRepository.findByStudentId(studentId).orElse(null);
            if (user != null) {
                AttendanceRecord record = attendanceRecordRepository
                        .findByEventIdAndUserStudentId(event.getId(), studentId)
                        .orElseGet(() -> {
                            AttendanceRecord newRecord = new AttendanceRecord();
                            newRecord.setEvent(event);
                            newRecord.setUser(user);
                            return newRecord;
                        });
                record.setStatus(status);
                attendanceRecordRepository.save(record);
            }
        }
    }

    public Map<String, String> getAttendanceForEvent(String eventTitle) {
        Map<String, String> result = new HashMap<>();
        Event event = eventRepository.findByTitle(eventTitle).orElse(null);
        if (event == null) return result;

        List<AttendanceRecord> records = attendanceRecordRepository.findByEventId(event.getId());
        for (AttendanceRecord record : records) {
            result.put(record.getUser().getStudentId(), record.getStatus().name().toLowerCase());
        }
        return result;
    }

    private LocalDate parseEventDate(String eventTitle) {
        try {
            Pattern pattern = Pattern.compile("\\d{2}/\\d{2}/\\d{4}");
            Matcher matcher = pattern.matcher(eventTitle);
            if (matcher.find()) {
                String dateStr = matcher.group();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                return LocalDate.parse(dateStr, formatter);
            }
        } catch (Exception e) {
            // Ignore and fallback
        }
        return LocalDate.now();
    }
}
