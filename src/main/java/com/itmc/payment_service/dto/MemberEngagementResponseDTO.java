package com.itmc.payment_service.dto;

public class MemberEngagementResponseDTO {
    private String studentId;
    private String fullName;
    private double engagementScore;
    private String rank;
    private double attendanceRate;
    private double fundPaidRate;

    public MemberEngagementResponseDTO() {}

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public double getEngagementScore() { return engagementScore; }
    public void setEngagementScore(double engagementScore) { this.engagementScore = engagementScore; }

    public String getRank() { return rank; }
    public void setRank(String rank) { this.rank = rank; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public double getFundPaidRate() { return fundPaidRate; }
    public void setFundPaidRate(double fundPaidRate) { this.fundPaidRate = fundPaidRate; }
}
