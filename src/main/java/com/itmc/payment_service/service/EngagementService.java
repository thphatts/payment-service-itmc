package com.itmc.payment_service.service;

import com.itmc.payment_service.dto.MemberEngagementResponseDTO;
import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.model.AttendanceStatus;
import com.itmc.payment_service.model.TransactionStatus;
import com.itmc.payment_service.repository.AttendanceRecordRepository;
import com.itmc.payment_service.repository.CampaignRepository;
import com.itmc.payment_service.repository.EventRepository;
import com.itmc.payment_service.repository.TransactionRepository;
import com.itmc.payment_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EngagementService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    public List<MemberEngagementResponseDTO> getEngagementOverview() {
        List<User> users = userRepository.findAll();
        List<MemberEngagementResponseDTO> overviewList = new ArrayList<>();

        for (User user : users) {
            overviewList.add(calculateUserEngagement(user));
        }

        // Sort by engagement score descending
        return overviewList.stream()
                .sorted((a, b) -> Double.compare(b.getEngagementScore(), a.getEngagementScore()))
                .collect(Collectors.toList());
    }

    public MemberEngagementResponseDTO getMemberEngagement(String studentId) {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return calculateUserEngagement(user);
    }

    private MemberEngagementResponseDTO calculateUserEngagement(User user) {
        long totalEvents = eventRepository.count();
        double attendanceRate = 100.0;
        double attendancePoints = 100.0;

        if (totalEvents > 0) {
            long presentCount = attendanceRecordRepository.countByUserAndStatus(user, AttendanceStatus.PRESENT);
            long lateCount = attendanceRecordRepository.countByUserAndStatus(user, AttendanceStatus.LATE);
            
            // Present = 1.0, Late = 0.5, Absent = 0.0
            double totalAttendanceWeight = (presentCount * 1.0) + (lateCount * 0.5);
            attendancePoints = (totalAttendanceWeight / totalEvents) * 100.0;
            
            // Actual presence rate (Present + Late)
            attendanceRate = ((double)(presentCount + lateCount) / totalEvents) * 100.0;
        }

        long totalCampaigns = campaignRepository.count();
        double fundPaidRate = 100.0;
        double fundPoints = 100.0;

        if (totalCampaigns > 0) {
            long paidCampaigns = transactionRepository.countByUserAndStatus(user, TransactionStatus.SUCCESS);
            fundPaidRate = ((double) paidCampaigns / totalCampaigns) * 100.0;
            fundPoints = fundPaidRate;
        }

        // Formula: Score = Attendance * 60% + Fund * 40%
        double score = (attendancePoints * 0.6) + (fundPoints * 0.4);
        
        // Round to 1 decimal place
        score = Math.round(score * 10.0) / 10.0;
        attendanceRate = Math.round(attendanceRate * 10.0) / 10.0;
        fundPaidRate = Math.round(fundPaidRate * 10.0) / 10.0;

        String rank = "TRUNG BÌNH";
        if (score >= 90) rank = "XUẤT SẮC";
        else if (score >= 70) rank = "TÍCH CỰC";
        else if (score < 50) rank = "CẦN LƯU Ý";

        MemberEngagementResponseDTO dto = new MemberEngagementResponseDTO();
        dto.setStudentId(user.getStudentId());
        dto.setFullName(user.getFullName());
        dto.setEngagementScore(score);
        dto.setRank(rank);
        dto.setAttendanceRate(attendanceRate);
        dto.setFundPaidRate(fundPaidRate);

        return dto;
    }
}
