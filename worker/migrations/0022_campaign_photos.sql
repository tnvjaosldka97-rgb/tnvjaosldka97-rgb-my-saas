-- 39개 프로젝트에 업종별 Unsplash 대문 사진 URL 주입
-- 형식: https://images.unsplash.com/photo-{id}?w=800&q=75&auto=format&fit=crop
-- 로드 실패 시 IndustryArt SVG fallback으로 자동 전환됨

-- 외식 (한우·갈비·고기)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1558030006-450675393462?w=800&q=75&auto=format&fit=crop' WHERE slug = 'premium-hanwoo-6m';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=75&auto=format&fit=crop' WHERE slug = 'jinmioak-franchise-launch';

-- 외식 (오마카세/일식)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=75&auto=format&fit=crop' WHERE slug = 'shiro-omakase-luxury';

-- 외식 (포차/야식)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=800&q=75&auto=format&fit=crop' WHERE slug = 'bbq-mukbang-shorts';

-- 외식 (브런치/카페)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800&q=75&auto=format&fit=crop' WHERE slug = 'veganly-brunch-ig';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=75&auto=format&fit=crop' WHERE slug = 'cafe-franchise-package';

-- 외식 (한식 정식)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=800&q=75&auto=format&fit=crop' WHERE slug = 'boribap-newopen';

-- 외식 (밀키트/포장)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=75&auto=format&fit=crop' WHERE slug = 'dalkong-mealkit-cj';

-- 병원 (피부과/시술)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=75&auto=format&fit=crop' WHERE slug = 'skin-clinic-launch';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=75&auto=format&fit=crop' WHERE slug = 'yeoksam-dermatology-relaunch';

-- 병원 (한의원)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1591343395082-e120087004b4?w=800&q=75&auto=format&fit=crop' WHERE slug = 'bundang-chuck-hanbang';

-- 병원 (치과)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&q=75&auto=format&fit=crop' WHERE slug = 'busan-implant-package';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=800&q=75&auto=format&fit=crop' WHERE slug = 'dental-local-long';

-- 병원 (산부인과/의원)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1530026186672-2cd00ffc50fe?w=800&q=75&auto=format&fit=crop' WHERE slug = 'mom-clinic-ivf-ga';

-- 병원 (성형외과)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=75&auto=format&fit=crop' WHERE slug = 'daegu-plastic-open';

-- 뷰티 (화장품)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=75&auto=format&fit=crop' WHERE slug = 'beauty-influencer-ops';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=75&auto=format&fit=crop' WHERE slug = 'lipsy-d2c-launch';

-- 뷰티 (네일)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=75&auto=format&fit=crop' WHERE slug = 'maronie-nail-salon';

-- 뷰티 (스킨케어)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=75&auto=format&fit=crop' WHERE slug = 'glowly-skincare-tiktok';

-- 뷰티 (디퓨저/캔들)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=75&auto=format&fit=crop' WHERE slug = 'bomnal-aroma-kakao';

-- 뷰티 (헤어/샴푸)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&q=75&auto=format&fit=crop' WHERE slug = 'purebloom-haircare-review';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=800&q=75&auto=format&fit=crop' WHERE slug = 'hair-salon-retention';

-- 학원 (공부/수학)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=75&auto=format&fit=crop' WHERE slug = 'ipsi-academy-place';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800&q=75&auto=format&fit=crop' WHERE slug = 'edison-math-seminar';

-- 학원 (영어)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=75&auto=format&fit=crop' WHERE slug = 'talkingon-english-adult';

-- 학원 (코딩)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=75&auto=format&fit=crop' WHERE slug = 'codelab-kids-offline';

-- 학원 (미술)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&q=75&auto=format&fit=crop' WHERE slug = 'artbridge-highschool';

-- 커머스 (캠핑)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800&q=75&auto=format&fit=crop' WHERE slug = 'camp-green-coupang';

-- 커머스 (반려동물)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&q=75&auto=format&fit=crop' WHERE slug = 'petforever-naver-brand';

-- 커머스 (패션/여성의류)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=75&auto=format&fit=crop' WHERE slug = 'mintcolor-ig-shop';

-- 커머스 (와인)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=75&auto=format&fit=crop' WHERE slug = 'onwhay-wine-subscription';

-- 커머스 (리뷰/스마트스토어)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=75&auto=format&fit=crop' WHERE slug = 'smartstore-review-cro';

-- 서비스 (이사)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=75&auto=format&fit=crop' WHERE slug = 'jimssa-local-moving';

-- 서비스 (애견 훈련)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=75&auto=format&fit=crop' WHERE slug = 'bauhaus-pet-training';

-- 서비스 (법무)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1589994965851-a8f479c573a9?w=800&q=75&auto=format&fit=crop' WHERE slug = 'sinchon-law-consulting';

-- 서비스 (건축/인테리어)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&q=75&auto=format&fit=crop' WHERE slug = 'hwa-architect-portfolio';

-- 기타 (한옥/숙박)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800&q=75&auto=format&fit=crop' WHERE slug = 'jeonju-traditional-hanok';

-- 기타 (자동차 정비)
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800&q=75&auto=format&fit=crop' WHERE slug = 'auto-repair-local-seo';
UPDATE projects SET image_url = 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=75&auto=format&fit=crop' WHERE slug = 'namsan-car-repair';
