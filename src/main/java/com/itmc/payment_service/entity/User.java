package com.itmc.payment_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import com.itmc.payment_service.model.Role;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String studentId;

    private String fullName;

    @Email
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^(0|\\+84)(\\d{9})$", message = "Invalid phone number")
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private Role role;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}