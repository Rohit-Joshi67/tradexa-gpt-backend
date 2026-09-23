package com.tradexa.gpt.ipo;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "ipo_evaluations")
public class IpoEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "ipo_name", nullable = false)
    private String ipoName;

    @Column(name = "normalized_name", nullable = false, unique = true)
    private String normalizedName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "report_json", nullable = false, columnDefinition = "jsonb")
    private String reportJson;

    @Column(name = "model_used")
    private String modelUsed;

    @Column(name = "framework_version")
    private String frameworkVersion;

    @Column(name = "analysis_date", nullable = false)
    private ZonedDateTime analysisDate;

    @Column(name = "data_as_of")
    private ZonedDateTime dataAsOf;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    // Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public String getIpoName() { return ipoName; }
    public void setIpoName(String ipoName) { this.ipoName = ipoName; }
    public String getNormalizedName() { return normalizedName; }
    public void setNormalizedName(String normalizedName) { this.normalizedName = normalizedName; }
    public String getReportJson() { return reportJson; }
    public void setReportJson(String reportJson) { this.reportJson = reportJson; }
    public String getModelUsed() { return modelUsed; }
    public void setModelUsed(String modelUsed) { this.modelUsed = modelUsed; }
    public String getFrameworkVersion() { return frameworkVersion; }
    public void setFrameworkVersion(String frameworkVersion) { this.frameworkVersion = frameworkVersion; }
    public ZonedDateTime getAnalysisDate() { return analysisDate; }
    public void setAnalysisDate(ZonedDateTime analysisDate) { this.analysisDate = analysisDate; }
    public ZonedDateTime getDataAsOf() { return dataAsOf; }
    public void setDataAsOf(ZonedDateTime dataAsOf) { this.dataAsOf = dataAsOf; }
    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
    public ZonedDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(ZonedDateTime updatedAt) { this.updatedAt = updatedAt; }
}
