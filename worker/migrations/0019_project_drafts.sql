-- 비회원 프로젝트 접수 → 슈퍼 어드민 승인 플로우
-- LPLeadStart(1분 등록)가 여기로 들어오고, 슈퍼 어드민이 승인하면 projects 테이블로 승격됨

CREATE TABLE IF NOT EXISTS project_drafts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requester_name TEXT NOT NULL,
  requester_contact TEXT NOT NULL,
  industry TEXT NOT NULL,
  marketing_type TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',   -- 'pending' | 'approved' | 'rejected'
  submitted_at TEXT NOT NULL,
  reviewed_at TEXT,
  reviewed_by TEXT,
  approved_project_id INTEGER,
  reject_reason TEXT,
  FOREIGN KEY (approved_project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_drafts_status ON project_drafts(status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_drafts_submitted ON project_drafts(submitted_at DESC);
