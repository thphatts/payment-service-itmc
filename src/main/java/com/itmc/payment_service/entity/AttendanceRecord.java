package com.itmc.payment_service.entity;

import com.itmc.payment_service.model.AttendanceStatus;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", 
       uniqueConstraints = {@UniqueConstraint(columnNames = {"event_id", "user_id"})})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

    @Column(name = "marked_at")
    private LocalDateTime markedAt;

    @PrePersist
    @PreUpdate
    protected void onSave() {
        this.markedAt = LocalDateTime.now();
    }

    public AttendanceRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Event getEvent() { return event; }
    public void setEvent(Event event) { this.event = event; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AttendanceStatus getStatus() { return status; }
    public void setStatus(AttendanceStatus status) { this.status = status; }

    public LocalDateTime getMarkedAt() { return markedAt; }
    public void setMarkedAt(LocalDateTime markedAt) { this.markedAt = markedAt; }
}
