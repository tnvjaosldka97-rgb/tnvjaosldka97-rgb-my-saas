-- 마켓 사용자 계정 (광고주 / 대행사)
CREATE TABLE IF NOT EXISTS market_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL DEFAULT 'advertiser',
  phone TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_market_users_email ON market_users(email);

-- 유저가 생성한 프로젝트/견적 추적 (NULL 허용: 시드 데이터 호환)
ALTER TABLE projects ADD COLUMN user_id INTEGER;
ALTER TABLE quotes ADD COLUMN user_id INTEGER;
