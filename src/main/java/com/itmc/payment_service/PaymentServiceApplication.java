package com.itmc.payment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import com.itmc.payment_service.entity.Campaign;
import com.itmc.payment_service.model.CampaignStatus;
import com.itmc.payment_service.repository.CampaignRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@SpringBootApplication
public class PaymentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(PaymentServiceApplication.class, args);
	}

	@Bean
	public CommandLineRunner initData(CampaignRepository campaignRepository) {
		return args -> {
			if (campaignRepository.findByCampaignCode("CAMP01").isEmpty()) {
				Campaign campaign = new Campaign();
				campaign.setCampaignCode("CAMP01");
				campaign.setTitle("Quỹ Câu Lạc Bộ ITMC - Học kỳ 2");
				campaign.setAmountRequired(new BigDecimal("100000"));
				campaign.setStatus(CampaignStatus.OPEN);
				campaign.setStartDate(LocalDateTime.now());
				campaign.setEndDate(LocalDateTime.now().plusMonths(3));
				campaignRepository.save(campaign);
				System.out.println(">>> Seeded default campaign: CAMP01");
			}
		};
	}
}
