package com.itmc.payment_service.service;

import com.itmc.payment_service.entity.User;
import com.itmc.payment_service.repository.UserRepository;
import com.itmc.payment_service.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, 
                       JwtTokenProvider jwtTokenProvider,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public String[] login(String studentId, String password) throws Exception {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + studentId));

        if (user.getPassword() == null) {
            // Migration: Nếu tài khoản cũ chưa có mật khẩu, kiểm tra nếu pass nhập vào == MSSV
            if (password.equals(user.getStudentId())) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
            } else {
                throw new IllegalArgumentException("Mật khẩu chưa được thiết lập. Vui lòng dùng MSSV làm mật khẩu mặc định.");
            }
        } else if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password.");
        }

        String token = jwtTokenProvider.generateToken(user.getStudentId(), user.getRole().name());
        return new String[]{token, user.getRole().name(), user.getStudentId()};
    }

    public void changePassword(String studentId, String oldPassword, String newPassword) throws Exception {
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        if (user.getPassword() == null || !passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Mật khẩu cũ không chính xác.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
