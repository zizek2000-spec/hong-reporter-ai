# AI 파트너 — 배포 가이드 (비개발자용)

이 사이트는 OpenAI API를 사용해 발제, 기사 초안, 제목 후보를 생성합니다.

---

## 준비물

| 역할 | 사이트 | 설명 |
|------|--------|------|
| AI 엔진 | https://platform.openai.com | 기사 생성 API 키 발급 |
| 코드 저장소 | https://github.com | 사이트 파일 보관 |
| 웹 호스팅 | https://vercel.com | 인터넷 배포 |

---

## STEP 1 — OpenAI API 키 준비

1. https://platform.openai.com 접속
2. API Keys 화면에서 새 키를 생성
3. 생성된 키를 안전한 곳에 보관
4. Billing/사용 한도를 확인

주의: API 키는 브라우저 코드에 직접 넣지 않습니다. 반드시 Vercel 환경변수로만 저장합니다.

---

## STEP 2 — GitHub 저장소 확인

현재 저장소: https://github.com/zizek2000-spec/hong-reporter-ai

필수 파일:

- `index.html`
- `api/chat.js`
- `api/rss.js`
- `package.json`
- `vercel.json`

---

## STEP 3 — Vercel 배포 확인

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. `hong-reporter-ai` 프로젝트 선택
4. Git 연동이 켜져 있으면 GitHub main 브랜치 변경 시 자동으로 재배포됩니다.

---

## STEP 4 — API 키 환경변수 설정

Vercel 프로젝트에서 아래 환경변수를 설정합니다.

- **Name**: `OPENAI_API_KEY`
- **Value**: OpenAI Platform에서 발급한 API 키
- **Environment**: Production, Preview, Development 모두 적용 권장

선택 환경변수:

- **Name**: `OPENAI_MODEL`
- **Value**: 기본값은 `gpt-5`입니다. 다른 OpenAI 모델을 쓰고 싶을 때만 설정합니다.

환경변수를 추가하거나 수정한 뒤에는 최신 배포를 다시 실행해야 반영됩니다.

---

## STEP 5 — 완료 확인

1. Vercel 대시보드 상단의 배포 URL 접속
2. `발제 생성하기` 버튼 클릭
3. 텍스트가 스트리밍으로 출력되면 성공입니다.

---

## 문제 해결

| 증상 | 해결 방법 |
|------|-----------|
| `OPENAI_API_KEY` 미설정 오류 | Vercel Environment Variables에 `OPENAI_API_KEY` 추가 후 Redeploy |
| OpenAI API 오류 | API 키, 결제 상태, 사용 한도 확인 |
| 사이트 접속 불가 | Vercel 배포 상태 확인 |
| 글이 안 나오고 멈춤 | Vercel Function 로그와 브라우저 콘솔 오류 확인 |

---

## 이전 관련 메모

이전 버전은 `ANTHROPIC_API_KEY`와 Claude API를 사용했습니다. 현재 서버 함수는 `OPENAI_API_KEY`가 있으면 OpenAI를 우선 사용합니다. 완전히 이전한 뒤에는 Vercel에서 기존 `ANTHROPIC_API_KEY`를 제거해도 됩니다.
