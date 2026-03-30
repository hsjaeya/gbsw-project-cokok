# API 엔드포인트

## 공통 사항

- **Base URL**: `https://api.cookclass.com/api`
- **인증**: `Authorization: Bearer <access_token>`
- **Content-Type**: `application/json`

## 공통 응답 포맷

```json
{ "success": true, "data": {} }
{ "success": false, "statusCode": 400, "message": "에러 메시지" }
```

## 권한 표기

| 표기 | 설명 |
|------|------|
| 🔓 Public | 인증 불필요 |
| 🔐 Auth | 로그인 필요 (STUDENT 이상) |
| 🛡 Admin | 관리자 권한 필요 |

---

## 1. 인증 (Auth)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/auth/register` | 🔓 | 회원가입 |
| POST | `/auth/login` | 🔓 | 로그인 |
| POST | `/auth/logout` | 🔐 | 로그아웃 |
| POST | `/auth/refresh` | 🔓 | Access Token 재발급 |

### POST `/auth/register`

**Request**
```json
{ "email": "user@example.com", "password": "P@ssw0rd!", "nickname": "요리왕" }
```

**Response 201**
```json
{ "success": true, "data": { "id": 1, "email": "user@example.com", "nickname": "요리왕" } }
```

### POST `/auth/login`

**Request**
```json
{ "email": "user@example.com", "password": "P@ssw0rd!" }
```

**Response 200**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGci...",
    "user": { "id": 1, "email": "user@example.com", "nickname": "요리왕", "role": "STUDENT" }
  }
}
```

---

## 2. 카테고리 (Categories)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/categories` | 🔓 | 목록 조회 |
| POST | `/categories` | 🛡 | 생성 |
| PATCH | `/categories/:id` | 🛡 | 수정 |
| DELETE | `/categories/:id` | 🛡 | 삭제 |

---

## 3. 강의 (Courses)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/courses` | 🔓 | 목록 조회 (필터/검색/페이지네이션) |
| GET | `/courses/:id` | 🔓 | 상세 조회 (섹션/강의 단위 포함) |
| POST | `/courses` | 🛡 | 강의 생성 |
| PATCH | `/courses/:id` | 🛡 | 강의 수정 |
| DELETE | `/courses/:id` | 🛡 | 강의 삭제 |

### GET `/courses` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 번호 (기본 1) |
| `limit` | number | 개수 (기본 12) |
| `categoryId` | number | 카테고리 필터 |
| `level` | string | `BEGINNER` \| `ELEMENTARY` \| `INTERMEDIATE` \| `ADVANCED` |
| `keyword` | string | 강의 제목 검색 |

### POST `/courses`

**Request**
```json
{ "title": "초보자를 위한 파스타", "description": "...", "categoryId": 2, "level": "BEGINNER" }
```

### GET `/courses/:id` Response

```json
{
  "success": true,
  "data": {
    "id": 1, "title": "초보자를 위한 파스타", "level": "BEGINNER",
    "category": { "id": 2, "name": "양식" },
    "sections": [
      {
        "id": 1, "title": "1장. 기초 재료", "order": 1,
        "lectures": [
          { "id": 1, "title": "파스타 면 종류", "youtubeVideoId": "VIDEO_ID", "durationSeconds": 480, "isPreview": true, "order": 1 }
        ]
      }
    ]
  }
}
```

---

## 4. 섹션 (Sections)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/courses/:courseId/sections` | 🛡 | 섹션 생성 |
| PATCH | `/courses/:courseId/sections/:id` | 🛡 | 섹션 수정 |
| DELETE | `/courses/:courseId/sections/:id` | 🛡 | 섹션 삭제 |

### POST `/courses/:courseId/sections`

**Request**
```json
{ "title": "1장. 파스타 기초 재료", "order": 1 }
```

---

## 5. 강의 단위 (Lectures)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/sections/:sectionId/lectures` | 🛡 | 강의 단위 생성 |
| PATCH | `/sections/:sectionId/lectures/:id` | 🛡 | 강의 단위 수정 |
| DELETE | `/sections/:sectionId/lectures/:id` | 🛡 | 강의 단위 삭제 |
| GET | `/lectures/:id` | 🔐 | 강의 단위 조회 (수강자 전용) |

### POST `/sections/:sectionId/lectures`

**Request**
```json
{ "title": "파스타 면 종류 알아보기", "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "order": 1, "isPreview": true }
```

---

## 6. 강의 시청 진입 (Auto Enrollment)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/enrollments/auto` | 🔐 | 강의 시청 페이지 첫 진입 시 자동 호출, 이미 존재하면 무시 |

### POST `/enrollments/auto`

**Request**
```json
{ "courseId": 5 }
```

**Response 200**
```json
{ "success": true, "data": { "enrollmentId": 3, "courseId": 5 } }
```

---

## 7. 수강 진도 (Progress)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/progress/complete` | 🔐 | 강의 단위 완료 처리 |
| GET | `/progress/course/:courseId` | 🔐 | 강의 진도 조회 |

### POST `/progress/complete`

**Request**
```json
{ "lectureId": 12, "enrollmentId": 3 }
```

**Response 200**
```json
{ "success": true, "data": { "lectureId": 12, "isCompleted": true, "progressRate": 45.5 } }
```

### GET `/progress/course/:courseId` Response

```json
{
  "success": true,
  "data": {
    "totalLectures": 20, "completedLectures": 9,
    "progressRate": 45.0,
    "completedLectureIds": [1, 2, 3, 5, 6, 7, 8, 10, 12]
  }
}
```

---

## 8. 마이페이지 (수강 내역)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/enrollments/me` | 🔐 | 내 수강 강의 목록 및 진도율 |

### GET `/enrollments/me` Response

```json
{
  "success": true,
  "data": [
    { "courseId": 1, "title": "초보자를 위한 파스타", "thumbnailUrl": "...", "progressRate": 45.0 }
  ]
}
```

---

## 9. 관리자 (Admin)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/admin/users` | 🛡 | 전체 회원 목록 조회 |

> 강의/섹션/강의 단위/카테고리 관리는 위 3~5번 항목의 🛡 엔드포인트와 동일하게 사용합니다.

---

## 10. HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 요청 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 데이터 충돌 |
| 500 | 서버 오류 |
