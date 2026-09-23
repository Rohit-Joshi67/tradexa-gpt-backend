CREATE TABLE ipo_evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    ipo_name VARCHAR(255) NOT NULL,
    normalized_name VARCHAR(255) NOT NULL UNIQUE,
    report_json JSONB NOT NULL,
    model_used VARCHAR(100),
    framework_version VARCHAR(50),
    analysis_date TIMESTAMP WITH TIME ZONE NOT NULL,
    data_as_of TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ipo_evaluations_normalized_name ON ipo_evaluations(normalized_name);
