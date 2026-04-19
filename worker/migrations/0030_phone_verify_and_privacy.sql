-- 마케팅천재들 벤치마킹: 유선 검증 단계 + 개인정보 제3자 제공 동의

-- 1) project_drafts 에 유선 검증 + 개인정보 동의 컬럼
ALTER TABLE project_drafts ADD COLUMN phone_verified_at TEXT;
ALTER TABLE project_drafts ADD COLUMN phone_verified_by TEXT;
ALTER TABLE project_drafts ADD COLUMN phone_verify_note TEXT;
ALTER TABLE project_drafts ADD COLUMN privacy_consent INTEGER NOT NULL DEFAULT 0;
ALTER TABLE project_drafts ADD COLUMN privacy_consent_at TEXT;

CREATE INDEX IF NOT EXISTS idx_drafts_phone_verified_at ON project_drafts(phone_verified_at);
