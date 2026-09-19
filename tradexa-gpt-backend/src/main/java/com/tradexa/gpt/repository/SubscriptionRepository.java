package com.tradexa.gpt.repository;

import com.tradexa.gpt.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findTopByUserIdAndStatusInOrderByCreatedAtDesc(
            Long userId, List<String> statuses);

    Optional<Subscription> findByProviderSubscriptionId(String providerSubscriptionId);

    List<Subscription> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Subscription> findByStatusAndCreatedAtBefore(String status, Instant cutoff);
}
