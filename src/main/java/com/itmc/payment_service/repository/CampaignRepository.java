package com.itmc.payment_service.repository;

import com.itmc.payment_service.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    // Tìm đợt thu quỹ dựa trên mã code (VD: CAMP01)
    Optional<Campaign> findByCampaignCode(String campaignCode);
}