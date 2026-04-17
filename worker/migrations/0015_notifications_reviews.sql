-- 알림: 유저가 받는 이벤트 기반 메시지
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  kind TEXT NOT NULL,
  project_id INTEGER,
  application_id INTEGER,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES market_users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read_at);

-- 마켓 플랫폼용 리뷰 (기존 reviews는 quote_id FK 때문에 신규 플로우와 불일치)
CREATE TABLE IF NOT EXISTS project_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  agency_user_id INTEGER NOT NULL,
  author_user_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (agency_user_id) REFERENCES market_users(id),
  FOREIGN KEY (author_user_id) REFERENCES market_users(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_reviews_unique
  ON project_reviews(project_id, author_user_id, agency_user_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_agency ON project_reviews(agency_user_id);
