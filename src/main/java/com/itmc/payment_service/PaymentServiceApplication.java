package com.itmc.payment_service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.model.CampaignStatus;
import com.itmc.payment_service.repository.CampaignRepository;

@SpringBootApplication
public class PaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner init(CampaignRepository campaignRepository) {
		return args -> {
			if (campaignRepository.findByCampaignCode("CAMP01").isEmpty()) {
				Campaign campaign = new Campaign();
				campaign.setCampaignCode("CAMP01");
				campaign.setTitle("Đóng Quỹ CLB ITMC");
				campaign.setAmountRequired(new BigDecimal("50000.00"));
				campaign.setStatus(CampaignStatus.OPEN);
				campaign.setStartDate(LocalDateTime.now());
				campaign.setEndDate(LocalDateTime.now().plusMonths(1));
				campaignRepository.save(campaign);
				System.out.println("Seeded default campaign: CAMP01");
			}
		};
	}
}
