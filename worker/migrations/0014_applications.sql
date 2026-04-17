-- 프로젝트 지원 (대행사 → 프로젝트) : 견적서는 "계약진행중" 단계에서만 업로드
CREATE TABLE IF NOT EXISTS project_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  agency_user_id INTEGER NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  selected_at TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_user_id) REFERENCES market_users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique ON project_applications(project_id, agency_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_project ON project_applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_agency ON project_applications(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON project_applications(status);

-- OAuth 계정 연결 (카카오/네이버)
CREATE TABLE IF NOT EXISTS market_oauth_identities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES market_users(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_oauth_provider ON market_oauth_identities(provider, provider_user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_user ON market_oauth_identities(user_id);

-- 프로젝트 stage (application flow)
-- 기존 status는 legacy로 유지, 새 stage 컬럼으로 funnel 관리
ALTER TABLE projects ADD COLUMN stage TEXT NOT NULL DEFAULT 'recruiting';
-- stage: 'recruiting' | 'contracting' | 'executing' | 'completed'

UPDATE projects SET stage = 'recruiting' WHERE status IN ('recruiting', 'closing');
UPDATE projects SET stage = 'executing' WHERE status = 'in_progress';
UPDATE projects SET stage = 'completed' WHERE status = 'completed';
