-- ==============================================================================
-- AI Marketing Automation SaaS - PostgreSQL Master Schema (Global Multi-Tenant)
-- ==============================================================================

-- Enable pgvector for embedding-based semantic retrieval
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy full-text keyword search

-- 1. Organizations (Tenants)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    country_code VARCHAR(2) NOT NULL DEFAULT 'US',
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    timezone VARCHAR(100) NOT NULL DEFAULT 'America/New_York',
    default_language VARCHAR(10) NOT NULL DEFAULT 'en-US',
    subscription_tier VARCHAR(50) NOT NULL DEFAULT 'GROWTH',
    model_mode VARCHAR(50) NOT NULL DEFAULT 'COST_SAVER_HYBRID', -- LOCAL_ONLY | COST_SAVER_HYBRID | MAX_PERFORMANCE
    compliance JSONB NOT NULL DEFAULT '{"gdprCompliant": true, "ccpaCompliant": true, "canSpamCompliant": true}'::jsonb,
    channels_enabled JSONB NOT NULL DEFAULT '{"email": true, "sms": true, "whatsapp": true, "metaSocial": true, "linkedIn": true, "xSocial": true, "googleBusiness": true}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users & Team Members
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MARKETER', -- OWNER | ADMIN | MARKETER | CONTENT_CREATOR | VIEWER
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(organization_id, email)
);

-- 3. Business Profiles
CREATE TABLE IF NOT EXISTS business_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    website_url TEXT,
    city VARCHAR(100) NOT NULL,
    state_or_region VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    target_audience TEXT NOT NULL,
    services JSONB NOT NULL DEFAULT '[]'::jsonb,
    unique_selling_points JSONB NOT NULL DEFAULT '[]'::jsonb,
    competitors JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Brand Voices
CREATE TABLE IF NOT EXISTS brand_voices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
    tone VARCHAR(100) NOT NULL DEFAULT 'PROFESSIONAL_EMPATHETIC',
    style_guidelines TEXT NOT NULL,
    forbidden_words JSONB NOT NULL DEFAULT '[]'::jsonb,
    key_phrases JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. AI Usage & Cost Metering Table
CREATE TABLE IF NOT EXISTS ai_usage_meters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    task_tier VARCHAR(50) NOT NULL, -- TIER_0_LOCAL_UTILITY | TIER_1_LOW_COST_CLOUD | TIER_2_FRONTIER_REASONING
    provider VARCHAR(50) NOT NULL, -- OLLAMA | OPENAI | ANTHROPIC | GEMINI | GROQ | DEEPSEEK
    model_name VARCHAR(100) NOT NULL,
    prompt_tokens INT NOT NULL DEFAULT 0,
    completion_tokens INT NOT NULL DEFAULT 0,
    total_tokens INT NOT NULL DEFAULT 0,
    estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
    latency_ms INT NOT NULL DEFAULT 0,
    task_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Knowledge Documents & Vectors (Prep for Milestone 2 RAG)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- WEBSITE | PDF | DOCX | FAQ | MANUAL
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    tsv_content tsvector GENERATED ALWAYS AS (to_tsvector('english', content)) STORED,
    embedding vector(768), -- Matches nomic-embed-text (768 dimensions)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast multi-tenant isolation and hybrid search
CREATE INDEX IF NOT EXISTS idx_users_org ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_org ON ai_usage_meters(organization_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_org ON document_chunks(organization_id);
CREATE INDEX IF NOT EXISTS idx_doc_chunks_tsv ON document_chunks USING GIN(tsv_content);
-- Vector cosine similarity index
CREATE INDEX IF NOT EXISTS idx_doc_chunks_vector ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
