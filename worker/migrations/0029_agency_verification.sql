-- A: 대행사 검증 파이프라인 — 제출/검토/승인/반려 상태 머신
ALTER TABLE agencies ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'none';
   -- 'none' | 'submitted' | 'approved' | 'rejected'
ALTER TABLE agencies ADD COLUMN verification_submitted_at TEXT;
ALTER TABLE agencies ADD COLUMN verification_reviewed_at TEXT;
ALTER TABLE agencies ADD COLUMN verification_reviewed_by TEXT;
ALTER TABLE agencies ADD COLUMN verification_reject_reason TEXT;
CREATE INDEX IF NOT EXISTS idx_agencies_verification_status ON agencies(verification_status);

-- 이미 verified=1 인 대행사는 approved 로 간주
UPDATE agencies SET verification_status = 'approved', verification_reviewed_at = datetime('now') WHERE verified = 1;
