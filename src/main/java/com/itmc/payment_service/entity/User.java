package com.itmc.payment_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.management.relation.Role;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", unique = true, nullable = false)
    private String member_id;

    @Column(nullable = false)
    private String fullName;

    @Email(message = "Định dạng email không hợp lệ")
    @Column(unique = true, nullable = false)
    private String email;

    @Pattern(regexp = "^(0|\\+84)[0-9]{9}$", message = "Số điện thoại không hợp lệ")
    @Column(name = "phone_number")
    private String phoneNumber;

    // ---------------------------

    @Enumerated(EnumType.STRING)
    private Role role; // Enum: ADMIN, MEMBER
}