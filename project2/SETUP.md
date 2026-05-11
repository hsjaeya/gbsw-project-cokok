# 프로젝트 실행 가이드

## 사전 요구사항

- Node.js 20 이상
- PostgreSQL 15 이상
- npm

---

## 1. PostgreSQL 데이터베이스 설정

PostgreSQL에 접속하여 아래 명령어로 데이터베이스와 사용자를 생성합니다.

```sql
CREATE USER postgres WITH PASSWORD '1234';
CREATE DATABASE cokok OWNER postgres;
```

> 이미 `postgres` 계정이 있다면 비밀번호만 `1234`으로 맞춰주세요.

---

## 2. 환경 변수 파일 배치

zip 파일에 포함된 `.env` 파일들을 아래 위치에 복사합니다.

```
project2/
├── backend/.env     ← backend_env.env 를 여기에 .env 로 저장
└── frontend/.env    ← frontend_env.env 를 여기에 .env 로 저장
```

### backend/.env 내용

```
DATABASE_URL="postgresql://postgres:1234@localhost:5432/cokok"
JWT_ACCESS_SECRET="access_secret_key_change_in_production"
JWT_REFRESH_SECRET="refresh_secret_key_change_in_production"
JWT_ACCESS_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"
```

### frontend/.env 내용

```
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 3. 백엔드 실행

```bash
cd backend
npm install
npm run db:migrate    # Prisma 마이그레이션 (DB 테이블 생성)
npm run start:dev     # 개발 서버 실행 (포트 3000)
```

> `db:migrate` 실행 시 마이그레이션 이름을 물어보면 아무 이름이나 입력하세요 (예: `init`).

---

## 4. 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev           # 개발 서버 실행 (포트 5173)
```

---

## 5. 접속

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000/api

---

## 문제 해결

| 증상                  | 해결 방법                                  |
| --------------------- | ------------------------------------------ |
| DB 연결 오류          | PostgreSQL 실행 여부 및 비밀번호 확인      |
| `prisma migrate` 실패 | DATABASE_URL이 .env에 올바르게 있는지 확인 |
| CORS 오류             | 백엔드가 먼저 실행되고 있는지 확인         |
