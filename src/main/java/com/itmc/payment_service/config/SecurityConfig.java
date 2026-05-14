package com.itmc.payment_service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Bắt buộc tắt CSRF thì Postman mới gọi POST được
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // Tạm thời mở cửa toàn bộ API để test tính năng trước
            );
        return http.build();
    }
}