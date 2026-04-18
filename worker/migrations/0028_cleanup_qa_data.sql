-- DB 정리: QA 테스트 사용자/프로젝트/관련 레코드 제거
-- 테스트 유저 id 1,2,3 (qatest-*/qaagency-*/qaupload- 이메일) 및 테스트 프로젝트 id=40 정리

-- 1) QA 테스트 프로젝트(id=40) 관련 자식 레코드 선제거
DELETE FROM project_applications WHERE project_id = 40;
DELETE FROM quotes WHERE project_id = 40;
DELETE FROM consultations WHERE project_id = 40;
DELETE FROM reviews WHERE project_id = 40;
DELETE FROM project_reviews WHERE project_id = 40;
DELETE FROM notifications WHERE project_id = 40;
DELETE FROM projects WHERE id = 40;

-- 2) QA 테스트 유저가 생성한 agency 프로필 제거 (id 기준)
DELETE FROM agencies WHERE user_id IN (1, 2, 3);

-- 3) QA 테스트 유저들이 남긴 notifications/applications 정리
DELETE FROM project_applications WHERE agency_user_id IN (1, 2, 3);
DELETE FROM notifications WHERE user_id IN (1, 2, 3);

-- 4) OAuth identities
DELETE FROM market_oauth_identities WHERE user_id IN (1, 2, 3);

-- 5) market_users 제거 (마지막)
DELETE FROM market_users WHERE id IN (1, 2, 3);
