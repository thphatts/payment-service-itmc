package com.itmc.payment_service.dto;

import java.util.Map;

public class AttendanceSubmitDTO {
    private String eventDate;
    private Map<String, String> attendanceData; // studentId -> status (present, late, absent)

    public AttendanceSubmitDTO() {}

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public Map<String, String> getAttendanceData() { return attendanceData; }
    public void setAttendanceData(Map<String, String> attendanceData) { this.attendanceData = attendanceData; }
}
