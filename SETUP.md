# 홍석희 AI 파트너 — 배포 가이드 (비개발자용)

총 소요 시간: 약 20분

---

## 준비물 (계정 3개)

아래 3개 사이트에 무료로 가입해야 합니다.

| 역할 | 사이트 | 설명 |
|------|--------|------|
| AI 엔진 | https://console.anthropic.com | 홍석희 AI 기사 생성의 핵심 |
| 코드 저장소 | https://github.com | 사이트 파일을 보관하는 곳 |
| 웹 호스팅 | https://vercel.com | 인터넷에 사이트를 올려주는 곳 |

---

## STEP 1 — Anthropic API 키 발급

1. https://console.anthropic.com 접속 → 회원가입 (구글 계정으로 가입 가능)
2. 로그인 후 왼쪽 메뉴에서 **"API Keys"** 클릭
3. **"Create Key"** 버튼 클릭 → 이름 입력 (예: `hong-reporter`) → Create
4. 생성된 키를 **반드시 복사해서 메모장에 저장** (다시 볼 수 없음!)
   - 형태: `sk-ant-api03-...` 로 시작하는 긴 문자열
5. **Billing 탭** → 카드 등록 (소량 사용 기준 월 1~5달러 수준)

---

## STEP 2 — GitHub에 파일 올리기

1. https://github.com 접속 → 회원가입 (이미 있으면 로그인)
2. 오른쪽 위 **"+"** 버튼 → **"New repository"** 클릭
3. Repository name에 `hong-reporter-ai` 입력
4. **Private** 선택 (공개하지 않으려면)
5. **"Create repository"** 클릭
6. 생성된 저장소 화면에서 **"uploading an existing file"** 링크 클릭
7. 이 폴더(hong-reporter-ai) 안의 파일 전체를 드래그앤드롭으로 업로드
   - `index.html`
   - `api/chat.js` (api 폴더째로 드래그)
   - `package.json`
   - `vercel.json`
8. **"Commit changes"** 클릭

---

## STEP 3 — Vercel에서 배포

1. https://vercel.com 접속 → **"Continue with GitHub"** 으로 가입/로그인
2. **"Add New... → Project"** 클릭
3. GitHub 저장소 목록에서 `hong-reporter-ai` 찾아 **"Import"** 클릭
4. 설정 화면에서 건드릴 것 없이 → **"Deploy"** 클릭
5. 잠시 기다리면 배포 완료 화면이 나옵니다

---

## STEP 4 — API 키 환경변수 설정 (핵심!)

배포 후 사이트에 들어가도 아직 작동 안 합니다.
AI 엔진 키를 입력해야 합니다.

1. Vercel 대시보드에서 내 프로젝트 클릭
2. 상단 탭 **"Settings"** 클릭
3. 왼쪽 메뉴 **"Environment Variables"** 클릭
4. 아래 내용 입력:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: (STEP 1에서 복사해둔 키 붙여넣기)
   - **Environment**: All 체크
5. **"Save"** 클릭
6. 상단 탭 **"Deployments"** → 가장 최근 배포 우클릭 → **"Redeploy"** 클릭

---

## STEP 5 — 완료 확인

1. Vercel 대시보드 상단에 표시되는 URL 접속 (예: `hong-reporter-ai.vercel.app`)
2. **"발제 생성하기"** 버튼 클릭
3. 텍스트가 스트리밍으로 출력되면 성공!

---

## 나만의 도메인 연결 (선택)

Vercel 프로젝트 Settings → Domains → 도메인 입력
(예: `hongai.co.kr` 등 직접 구매한 도메인 연결 가능)

---

## 문제 해결

| 증상 | 해결 방법 |
|------|-----------|
| "API 키 미설정" 오류 | STEP 4 다시 확인, Redeploy 필수 |
| 사이트 접속 불가 | Vercel 배포 상태 확인 (빨간색이면 오류) |
| 글이 안 나오고 멈춤 | API 키 형식 확인 (`sk-ant-api03-`로 시작해야 함) |
| 잔액 오류 | console.anthropic.com → Billing에서 크레딧 충전 |

---

문의: zizek2000@gmail.com
