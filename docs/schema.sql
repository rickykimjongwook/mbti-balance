-- Supabase에서 실행할 SQL
-- 1. 테이블 생성

CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  category TEXT DEFAULT '일상',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  mbti TEXT NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('A', 'B')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스
CREATE INDEX votes_question_id_idx ON votes(question_id);
CREATE INDEX votes_mbti_idx ON votes(mbti);

-- 3. RLS 비활성화 (서버에서 service key로 접근)
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes DISABLE ROW LEVEL SECURITY;

-- 4. 시드 데이터 (30개)
INSERT INTO questions (option_a, option_b, category) VALUES
  -- 연애
  ('먼저 고백하기', '고백 받을 때까지 기다리기', '연애'),
  ('연애 초반 매일 연락하기', '연애 초반 쿨하게 2~3일에 한 번 연락', '연애'),
  ('싸우고 바로 화해하기', '혼자 생각 정리 후 다음날 화해', '연애'),
  ('기념일 깜짝 이벤트', '기념일 편하게 맛있는 거 먹기', '연애'),
  ('애인과 모든 걸 공유', '각자 개인 공간 확실히 유지', '연애'),

  -- 일상
  ('아침형 인간으로 일찍 일어나기', '저녁형 인간으로 늦게까지 활동', '일상'),
  ('여행은 꼼꼼한 계획형', '여행은 즉흥 노플랜형', '일상'),
  ('집에서 혼자 쉬기', '밖에서 사람들 만나기', '일상'),
  ('돈을 아껴서 저축', '돈은 벌면서 쓰는 것', '일상'),
  ('유명한 맛집 줄 서서 먹기', '줄 없는 동네 맛집 편하게', '일상'),

  -- 직장
  ('칼퇴 후 내 시간 즐기기', '야근해서라도 완벽하게 끝내기', '직장'),
  ('팀 프로젝트에서 리더 맡기', '팀 프로젝트에서 서포터 역할', '직장'),
  ('재미있지만 연봉 낮은 직장', '재미없지만 연봉 높은 직장', '직장'),
  ('재택근무 100%', '매일 출근하는 오피스 근무', '직장'),
  ('실패해도 도전하는 스타트업', '안정적인 대기업', '직장'),

  -- 음식
  ('새로운 음식 도전', '익숙한 음식 반복', '음식'),
  ('매운 걸 먹고 땀 뻘뻘', '안 맵고 깔끔한 음식', '음식'),
  ('밥 먹고 바로 디저트', '디저트는 좀 있다가', '음식'),
  ('혼밥이 더 편해', '밥은 꼭 같이 먹어야 해', '음식'),
  ('배달 음식', '직접 요리해 먹기', '음식'),

  -- 취향
  ('넷플릭스 몰아보기', '일주일에 1화씩 천천히', '취향'),
  ('책 한 권 집중해서 읽기', '여러 책 번갈아 읽기', '취향'),
  ('운동은 헬스장', '운동은 밖에서 달리기', '취향'),
  ('주말에 카페에서 작업', '주말에 집에서 뒹굴기', '취향'),
  ('음악 듣고 집중', '조용한 환경에서 집중', '취향'),

  -- MBTI 특성
  ('계획을 세우고 지키기', '흘러가는 대로 유연하게', 'MBTI'),
  ('감정적으로 솔직하게 말하기', '논리적으로 차분하게 말하기', 'MBTI'),
  ('많은 사람과 얕게 알기', '소수와 깊게 알기', 'MBTI'),
  ('현재에 집중하기', '미래를 계획하며 살기', 'MBTI'),
  ('규칙을 따르기', '규칙보다 상황에 맞게 판단', 'MBTI');
