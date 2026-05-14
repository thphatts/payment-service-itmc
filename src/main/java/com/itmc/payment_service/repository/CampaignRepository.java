package com.itmc.payment_service.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import com.itmc.payment_service.entity.Campaign;
import java.util.Optional;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    Optional<Campaign> findByCampaignCode(String campaignCode);
}