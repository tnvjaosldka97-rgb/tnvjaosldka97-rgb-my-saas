-- Phase A + C-4 준비: market_users ↔ agencies 연결 · 사용자 제재 · 아바타 · draft 결제 상태

-- C-1: 대행사 프로필 ↔ market_users 연결 (가입 시 agencies 자동 생성)
ALTER TABLE agencies ADD COLUMN user_id INTEGER;
CREATE INDEX IF NOT EXISTS idx_agencies_user_id ON agencies(user_id);

-- C-3: 사용자 제재 상태 (active / suspended)
ALTER TABLE market_users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
CREATE INDEX IF NOT EXISTS idx_market_users_status ON market_users(status);

-- M-4: 프로필 아바타 URL
ALTER TABLE market_users ADD COLUMN avatar_url TEXT;

-- C-4: draft 등록비 결제 상태 (외부 PG 연동 전 뼈대만 — 실제 결제는 추후 Toss/PortOne 연결)
ALTER TABLE project_drafts ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid';
ALTER TABLE project_drafts ADD COLUMN payment_amount INTEGER NOT NULL DEFAULT 10000;
ALTER TABLE project_drafts ADD COLUMN payment_method TEXT;
ALTER TABLE project_drafts ADD COLUMN payment_received_at TEXT;
ALTER TABLE project_drafts ADD COLUMN payment_refunded_at TEXT;
ALTER TABLE project_drafts ADD COLUMN payment_reference TEXT;
