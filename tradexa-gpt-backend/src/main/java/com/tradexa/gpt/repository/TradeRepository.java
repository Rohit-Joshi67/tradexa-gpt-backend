package com.tradexa.gpt.repository;

import com.tradexa.gpt.entity.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Integer> {

    List<Trade> findAllByUserId(Long userId);

    Optional<Trade> findByIdAndUserId(Integer id, Long userId);

    boolean existsByIdAndUserId(Integer id, Long userId);
}
