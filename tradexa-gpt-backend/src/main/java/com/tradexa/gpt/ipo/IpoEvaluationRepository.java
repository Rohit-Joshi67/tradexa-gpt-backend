package com.tradexa.gpt.ipo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IpoEvaluationRepository extends JpaRepository<IpoEvaluation, UUID> {
    Optional<IpoEvaluation> findByNormalizedName(String normalizedName);
}
