-- M-5: 기본 이메일 템플릿 6종 시드 (운영팀 템플릿 편집 시점에 참고용)
INSERT OR IGNORE INTO email_templates (name, subject, body_html, body_text, created_at, updated_at) VALUES
(
  'welcome',
  '[마케팅천재야] 가입을 환영합니다',
  '<div style="font-family: Pretendard, sans-serif;"><h1>{{name}}님, 가입을 환영합니다</h1><p>마케팅천재야에 오신 것을 환영합니다. 궁금한 점은 help@mcy.co.kr로 문의주세요.</p></div>',
  '{{name}}님, 마케팅천재야 가입을 환영합니다. 문의: help@mcy.co.kr',
  datetime('now'), datetime('now')
),
(
  'project_submitted',
  '[마케팅천재야] 프로젝트가 접수되었습니다',
  '<div style="font-family: Pretendard, sans-serif;"><h1>접수 완료</h1><p>운영팀 검토 후 24시간 내 공개되며, 공개 시 안내 메일을 보내드립니다.</p></div>',
  '접수 완료. 24시간 내 공개 안내 메일 발송.',
  datetime('now'), datetime('now')
),
(
  'draft_approved',
  '[마케팅천재야] 접수하신 프로젝트가 공개되었습니다',
  '<div style="font-family: Pretendard, sans-serif;"><h1>{{name}}님, 프로젝트가 공개되었습니다</h1><p>{{projectTitle}}이(가) 플랫폼에 공개되어 대행사 견적을 받기 시작합니다.</p></div>',
  '{{name}}님, {{projectTitle}} 공개 완료.',
  datetime('now'), datetime('now')
),
(
  'draft_rejected',
  '[마케팅천재야] 프로젝트 접수 검토 결과',
  '<div style="font-family: Pretendard, sans-serif;"><h1>{{name}}님, 공개되지 못했습니다</h1><p>사유: {{reason}}</p><p>문의: help@mcy.co.kr</p></div>',
  '{{name}}님, 접수가 공개되지 못했습니다. 사유: {{reason}}',
  datetime('now'), datetime('now')
),
(
  'application_selected',
  '[마케팅천재야] 축하합니다! 파트너로 선정되었습니다',
  '<div style="font-family: Pretendard, sans-serif;"><h1>{{agencyName}}, 선정되었습니다</h1><p>{{projectTitle}} 프로젝트의 계약 진행 단계로 넘어가세요.</p></div>',
  '{{agencyName}} 선정. {{projectTitle}} 계약 단계 이동.',
  datetime('now'), datetime('now')
),
(
  'review_request',
  '[마케팅천재야] 완료한 프로젝트 리뷰를 부탁드려요',
  '<div style="font-family: Pretendard, sans-serif;"><h1>{{name}}님, 리뷰 한 줄 부탁드려요</h1><p>{{projectTitle}} 프로젝트가 완료되었습니다. 다음 광고주에게 도움이 되는 리뷰를 남겨주세요.</p></div>',
  '{{name}}님, {{projectTitle}} 리뷰를 부탁드립니다.',
  datetime('now'), datetime('now')
);
