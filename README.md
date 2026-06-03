# WellGym

WellGym은 헬스 운동 기록, 인바디 기록, AI 식단 추천, AI 운동 피드백을 제공하는 PWA 웹 애플리케이션입니다.

프론트엔드는 모바일 웹에서 앱처럼 사용할 수 있도록 만들었고, 백엔드는 로그인, 운동 일지, 인바디 기록, AI 기능을 API로 제공합니다.

## 바로 사용하기

별도의 설치나 로컬 서버 실행 없이 아래 배포 주소에서 바로 사용할 수 있습니다.

```text
https://wellgym-lemon.vercel.app
```

배포된 서비스는 Vercel 프론트엔드, Render 백엔드, Supabase PostgreSQL 데이터베이스를 사용합니다. 따라서 내 PC에서 Node.js, Docker, PostgreSQL 서버를 직접 실행하지 않아도 외부 PC와 모바일에서 접속할 수 있습니다.

로컬에서 코드를 수정하거나 개발 환경을 직접 실행하려면 아래 설치 및 실행 방법을 따르면 됩니다.

## 1. 프로젝트 구성

```text
WellGym/
├─ src/                 # 프론트엔드 화면 코드
├─ public/              # PWA 아이콘, 정적 파일
├─ backend/             # 백엔드 API 서버
│  ├─ src/              # 백엔드 TypeScript 코드
│  ├─ prisma/           # DB 테이블 설계와 마이그레이션
│  ├─ docker-compose.yml
│  └─ .env.example
├─ package.json         # 프론트엔드 실행 명령
└─ README.md
```

## 2. 사용 기술

프론트엔드:

- Vite
- React
- TypeScript
- Tailwind CSS
- Zustand
- vite-plugin-pwa

백엔드:

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- JWT 로그인
- Gemini API 또는 OpenAI API

## 3. 실행 전에 설치해야 하는 것

처음 실행하는 컴퓨터에는 아래 프로그램이 필요합니다.

### 3.1 Node.js

프론트엔드와 백엔드를 실행하기 위해 필요합니다.

- 권장 버전: Node.js 20 이상
- 다운로드: https://nodejs.org/

설치 확인:

```powershell
node -v
npm -v
```

### 3.2 Docker Desktop

PostgreSQL 데이터베이스를 쉽게 실행하기 위해 필요합니다.

- 다운로드: https://www.docker.com/products/docker-desktop/

설치 후 Docker Desktop을 실행해 둔 상태에서 아래 명령을 확인합니다.

```powershell
docker --version
docker compose version
```

### 3.3 Git

프로젝트를 내려받기 위해 필요합니다.

- 다운로드: https://git-scm.com/

설치 확인:

```powershell
git --version
```

## 4. 프로젝트 내려받기

```powershell
git clone <프로젝트_깃허브_URL>
cd WellGym
```

이미 압축 파일로 받은 경우에는 압축을 풀고 `WellGym` 폴더로 이동하면 됩니다.

```powershell
cd WellGym
```

## 5. API 키 준비

이 프로젝트의 기본 AI 제공자는 Gemini입니다.

AI 기능은 다음에 사용됩니다.

- 인바디 사진 자동 인식
- 맞춤형 식단 추천
- 운동 피드백 생성

### 5.1 Gemini API 키 발급 방법

1. Google AI Studio에 접속합니다.
   - https://aistudio.google.com/
2. Google 계정으로 로그인합니다.
3. `Get API key` 또는 `API 키 만들기`를 선택합니다.
4. 생성된 API 키를 복사합니다.
5. 아래 `backend/.env` 파일의 `GEMINI_API_KEY`에 붙여 넣습니다.

예시:

```env
AI_PROVIDER="gemini"
GEMINI_API_KEY="여기에_발급받은_Gemini_API_KEY_입력"
GEMINI_MODEL="gemini-2.5-flash"
```

### 5.2 API 키가 없어도 실행할 수 있나요?

네. API 키가 없어도 로그인, 운동 일지, 인바디 직접 입력, PWA 화면은 실행할 수 있습니다.

다만 아래 기능은 API 키가 없으면 동작하지 않습니다.

- 인바디 사진 자동 인식
- AI 식단 추천
- AI 운동 피드백

채점자가 전체 기능을 확인하려면 Gemini API 키를 넣어야 합니다.

### 5.3 테스트용 API 키 제공에 대한 안내

보안상 API 키는 GitHub나 README에 직접 올리면 안 됩니다. 공개 저장소에 API 키를 올리면 다른 사람이 무단으로 사용할 수 있습니다.

채점용 테스트 키를 제공해야 하는 경우에는 다음 방법 중 하나를 권장합니다.

- 학교 LMS의 비공개 제출란에 별도로 전달
- 이메일 또는 비공개 문서로 전달
- 시연 당일 직접 입력

## 6. 백엔드 실행 방법

백엔드는 `backend` 폴더에서 실행합니다.

### 6.1 백엔드 패키지 설치

```powershell
cd backend
npm install
```

### 6.2 환경변수 파일 만들기

`backend/.env.example` 파일을 복사해서 `backend/.env` 파일을 만듭니다.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS 또는 Linux:

```bash
cp .env.example .env
```

### 6.3 backend/.env 설정

`backend/.env` 파일을 열고 아래처럼 설정합니다.

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wellgym?schema=public"
JWT_SECRET="replace-with-a-long-random-secret-value-32-characters"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"

AI_PROVIDER="gemini"
GEMINI_API_KEY="여기에_Gemini_API_KEY_입력"
GEMINI_MODEL="gemini-2.5-flash"

OPENAI_API_KEY=""
OPENAI_MODEL="gpt-4o-2024-08-06"
MEMORY_AUTH_STORE="false"
```

중요:

- `JWT_SECRET`은 32자 이상이어야 합니다.
- `GEMINI_API_KEY`는 AI 기능을 테스트할 때 필요합니다.
- 프론트엔드 주소가 `http://localhost:5173`이 아니라면 `CORS_ORIGIN`에 해당 주소를 추가해야 합니다.

### 6.4 PostgreSQL 실행

Docker Desktop을 켠 뒤, `backend` 폴더에서 실행합니다.

```powershell
docker compose up -d
```

정상 실행 확인:

```powershell
docker ps
```

`wellgym-postgres` 컨테이너가 보이면 정상입니다.

### 6.5 데이터베이스 테이블 생성

```powershell
npm run prisma:migrate
```

### 6.6 백엔드 서버 실행

```powershell
npm run dev
```

정상 실행되면 백엔드는 아래 주소에서 동작합니다.

```text
http://localhost:4000
```

백엔드 상태 확인:

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:4000/health
```

정상이라면 아래와 비슷하게 표시됩니다.

```json
{
  "ok": true,
  "service": "wellgym-api"
}
```

## 7. 프론트엔드 실행 방법

프론트엔드는 프로젝트 루트 폴더에서 실행합니다.

백엔드 실행 터미널은 그대로 둔 상태에서, 새 터미널을 열어 아래 명령을 실행합니다.

```powershell
cd WellGym
npm install
```

프론트엔드 환경변수 파일을 확인합니다.

루트 폴더의 `.env`에 아래 값이 있으면 됩니다.

```env
VITE_API_BASE_URL=http://localhost:4000
```

프론트엔드 실행:

```powershell
npm run dev
```

정상 실행되면 아래 주소로 접속합니다.

```text
http://localhost:5173
```

## 8. 전체 실행 순서 요약

처음 실행할 때는 아래 순서대로 진행합니다.

1. Docker Desktop 실행
2. 백엔드 폴더로 이동

```powershell
cd backend
```

3. 백엔드 패키지 설치

```powershell
npm install
```

4. 환경변수 파일 생성

```powershell
Copy-Item .env.example .env
```

5. `backend/.env`에 Gemini API 키 입력
6. PostgreSQL 실행

```powershell
docker compose up -d
```

7. DB 테이블 생성

```powershell
npm run prisma:migrate
```

8. 백엔드 실행

```powershell
npm run dev
```

9. 새 터미널에서 프론트엔드 폴더로 이동

```powershell
cd WellGym
```

10. 프론트엔드 패키지 설치

```powershell
npm install
```

11. 프론트엔드 실행

```powershell
npm run dev
```

12. 브라우저에서 접속

```text
http://localhost:5173
```

## 9. 기능 테스트 방법

### 9.1 회원가입

1. `http://localhost:5173` 접속
2. `회원가입` 선택
3. 이름, 이메일, 비밀번호 입력
4. 비밀번호는 8자 이상 입력
5. `계정 만들기` 클릭

예시:

```text
이름: 테스트 사용자
이메일: test@example.com
비밀번호: password123
```

### 9.2 운동 일지 작성

1. 로그인 후 `운동 일지` 화면으로 이동
2. 캘린더의 빈 날짜 영역 클릭
3. 운동 제목, 시간, 체중, 컨디션 입력
4. 운동 이름, 카테고리, 기구, 세트별 kg/횟수 입력
5. `새 일지 저장` 클릭

### 9.3 운동 일지 수정

1. 캘린더에서 색상으로 표시된 기존 운동 바 클릭
2. `기존 일지 수정 모드` 모달 확인
3. 내용을 수정
4. `기존 일지 수정 저장` 클릭

### 9.4 운동 일지 삭제

1. 기존 운동 바 클릭
2. 모달 왼쪽 아래의 `일지 삭제` 클릭
3. 확인창에서 삭제 승인

### 9.5 인바디 직접 입력

1. `인바디` 화면으로 이동
2. 날짜, 체중, 키, 골격근량, 체지방량, 체지방률, BMI 입력
3. `인바디 기록 저장` 클릭
4. `인바디 기록이 저장되었습니다.` 메시지 확인

### 9.6 인바디 사진 자동 인식

이 기능은 Gemini API 키가 필요합니다.

1. `인바디` 화면으로 이동
2. `인바디 사진 업로드 및 자동 분석` 영역 클릭
3. 인바디 결과지 사진 선택
4. `사진 분석 중` 상태 확인
5. 분석 완료 후 날짜, 체중, 키, 골격근량, 체지방량, 체지방률, BMI가 자동 입력되는지 확인
6. 필요한 경우 값을 직접 수정
7. `인바디 기록 저장` 클릭

### 9.7 AI 식단 추천

이 기능은 Gemini API 키가 필요합니다.

1. 최신 인바디 기록을 먼저 저장
2. `식단` 화면으로 이동
3. 목표 체중, 활동량, 식단 선호 등을 입력
4. 식단 추천 생성
5. 일일 칼로리, 탄수화물/단백질/지방 비율, 식단 추천, 관리 팁 확인

### 9.8 AI 운동 피드백

이 기능은 Gemini API 키가 필요합니다.

1. 최신 인바디 기록을 저장
2. 운동 일지를 1개 이상 저장
3. `운동 일지` 화면 오른쪽의 `피드백 생성` 클릭
4. AI 피드백 팝업 확인
5. `피드백 저장` 클릭

## 10. PWA 확인 방법

PWA는 웹이지만 모바일 앱처럼 설치해서 사용할 수 있는 기능입니다.

### Chrome에서 확인

1. `http://localhost:5173` 접속
2. 주소창 오른쪽의 설치 아이콘 클릭
3. 또는 브라우저 메뉴에서 `저장 및 공유` → `페이지를 앱으로 설치` 선택
4. 설치 후 앱처럼 실행되는지 확인

### 모바일에서 확인

같은 네트워크에서 모바일 접속을 하려면 프론트엔드 실행 주소가 PC의 내부 IP로 접근 가능해야 합니다.

예시:

```text
http://192.168.0.10:5173
```

이 경우 백엔드 `CORS_ORIGIN`에도 모바일에서 접근하는 프론트 주소를 추가해야 합니다.

예시:

```env
CORS_ORIGIN="http://localhost:5173,http://192.168.0.10:5173"
```

설정 변경 후 백엔드를 재시작합니다.

## 11. 자주 발생하는 문제

### 11.1 회원가입 시 "비밀번호는 8자 이상이어야 합니다."

비밀번호가 너무 짧은 경우입니다.

해결:

```text
password123
```

처럼 8자 이상으로 입력합니다.

### 11.2 "요청 형식이 올바르지 않습니다."

입력값이 백엔드 검증 조건에 맞지 않는 경우입니다.

예:

- 이메일 형식이 아님
- 비밀번호가 8자 미만
- 운동 세트의 횟수가 0 이하
- 인바디 값이 숫자가 아님

### 11.3 "Failed to fetch"

프론트엔드가 백엔드에 연결하지 못한 경우입니다.

확인할 것:

1. 백엔드가 실행 중인지 확인

```text
http://localhost:4000/health
```

2. 프론트 `.env` 확인

```env
VITE_API_BASE_URL=http://localhost:4000
```

3. 백엔드 `.env`의 `CORS_ORIGIN` 확인

```env
CORS_ORIGIN="http://localhost:5173,http://localhost:3000"
```

### 11.4 "Gemini 사용량 한도 또는 요청 제한에 걸렸습니다."

Gemini API 무료 사용량 또는 요청 제한에 걸린 경우입니다.

해결:

- 잠시 후 다시 시도
- Google AI Studio에서 사용량 확인
- 유료 결제 설정 또는 다른 API 키 사용

### 11.5 "GEMINI_API_KEY가 설정되어 있지 않습니다."

백엔드 `.env`에 Gemini API 키가 없는 경우입니다.

해결:

```env
GEMINI_API_KEY="발급받은_API_KEY"
```

입력 후 백엔드 서버를 재시작합니다.

### 11.6 Docker에서 PostgreSQL이 실행되지 않을 때

Docker Desktop이 켜져 있는지 확인합니다.

```powershell
docker ps
```

컨테이너를 다시 실행합니다.

```powershell
cd backend
docker compose up -d
```

## 12. 개발자용 명령어

프론트엔드 빌드:

```powershell
npm run build
```

백엔드 빌드:

```powershell
cd backend
npm run build
```

Prisma Studio 실행:

```powershell
cd backend
npm run prisma:studio
```

Prisma Studio는 데이터베이스에 저장된 회원, 운동 일지, 인바디 기록을 화면에서 확인할 수 있는 도구입니다.

## 13. 주요 API 목록

인증:

- `POST /api/auth/signup`
- `POST /api/auth/login`

운동 일지:

- `POST /api/workout/logs`
- `GET /api/workout/logs`
- `PUT /api/workout/logs/:id`
- `DELETE /api/workout/logs/:id`

인바디:

- `POST /api/inbody`
- `GET /api/inbody`
- `GET /api/inbody/latest`

AI:

- `POST /api/ai/inbody-ocr`
- `POST /api/ai/diet`
- `POST /api/ai/feedback`

로그인 후 사용하는 API는 `Authorization: Bearer <token>` 헤더가 필요합니다.

## 14. 채점자 실행 체크리스트

설치 없이 배포본으로 바로 확인할 경우:

- `https://wellgym-lemon.vercel.app` 접속
- 회원가입 또는 로그인
- 운동 일지, 인바디, 식단 추천, 운동 피드백 기능 확인

로컬에서 직접 실행할 경우:

- Node.js 20 이상 설치
- Docker Desktop 설치 및 실행
- 프로젝트 다운로드
- `backend/.env` 생성
- `backend/.env`에 `JWT_SECRET` 32자 이상 입력
- AI 기능 테스트 시 `GEMINI_API_KEY` 입력
- `backend`에서 `npm install`
- `backend`에서 `docker compose up -d`
- `backend`에서 `npm run prisma:migrate`
- `backend`에서 `npm run dev`
- 루트 폴더에서 `npm install`
- 루트 폴더에서 `npm run dev`
- 브라우저에서 `http://localhost:5173` 접속

## 15. 실행 주소

배포된 프론트엔드:

```text
https://wellgym-lemon.vercel.app
```

배포된 백엔드:

```text
https://wellgym.onrender.com
```

배포된 백엔드 상태 확인:

```text
https://wellgym.onrender.com/health
```

로컬 프론트엔드:

```text
http://localhost:5173
```

로컬 백엔드:

```text
http://localhost:4000
```

로컬 백엔드 상태 확인:

```text
http://localhost:4000/health
```
