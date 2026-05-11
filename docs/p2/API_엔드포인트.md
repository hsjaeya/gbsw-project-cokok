# API 엔드포인트

## 공통 사항

- **Base URL**: `http://localhost:3000/api`
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
| Public | 인증 불필요 |
| Auth | 로그인 필요 (STUDENT 이상) |
| Instructor | INSTRUCTOR 이상 |
| Admin | ADMIN 권한 필요 |

---

## 1. 인증 (Auth)

| 메서드 | 경로 | 권한 | Rate Limit | 설명 |
|--------|------|------|------------|------|
| POST | `/auth/register` | Public| 5회/시간 | 회원가입 |
| POST | `/auth/login` | Public| 10회/분 | 로그인 |
| POST | `/auth/logout` | Auth| - | 로그아웃 |
| POST | `/auth/refresh` | Public| - | Access Token 재발급 |

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

> Refresh Token은 `Set-Cookie: refreshToken=...; HttpOnly; SameSite=Strict`로 응답

---

## 2. 사용자 (Users)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/users/me` | Auth| 내 프로필 조회 |
| PATCH | `/users/me` | Auth| 프로필 수정 (닉네임, 이메일, 비밀번호) |
| POST | `/users/me/avatar` | Auth| 프로필 이미지 업로드 (multipart/form-data) |

### PATCH `/users/me`

**Request**
```json
{ "nickname": "새닉네임", "email": "new@example.com", "password": "NewP@ss1!" }
```

### POST `/users/me/avatar`

**Content-Type**: `multipart/form-data`
**Field**: `avatar` (image file)

**Response 200**
```json
{ "success": true, "data": { "profileImageUrl": "http://localhost:3000/uploads/avatars/avatar-xxxx.jpg" } }
```

---

## 3. 카테고리 (Categories)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/categories` | Public| 목록 조회 |
| POST | `/categories` | Admin| 생성 |
| PATCH | `/categories/:id` | Admin| 수정 |
| DELETE | `/categories/:id` | Admin| 삭제 |

---

## 4. 강의 (Courses)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/courses` | Public| 목록 조회 (APPROVED만 노출, 필터/검색/페이지네이션) |
| GET | `/courses/:id` | Public| 상세 조회 (섹션/강의 단위 포함) |
| POST | `/courses` | Admin| 강의 직접 생성 |
| PATCH | `/courses/:id` | Admin| 강의 수정 |
| DELETE | `/courses/:id` | Admin| 강의 삭제 |

### GET `/courses` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 번호 (기본 1) |
| `limit` | number | 개수 (기본 12) |
| `categoryId` | number | 카테고리 필터 |
| `level` | string | BEGINNER / ELEMENTARY / INTERMEDIATE / ADVANCED |
| `keyword` | string | 강의 제목 검색 |

### GET `/courses/:id` Response

```json
{
  "success": true,
  "data": {
    "id": 1, "title": "초보자를 위한 파스타", "level": "BEGINNER", "status": "APPROVED",
    "category": { "id": 2, "name": "양식" },
    "instructor": { "id": 3, "nickname": "파스타마스터" },
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

## 5. 섹션 (Sections)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/courses/:courseId/sections` | Instructor| 섹션 생성 |
| PATCH | `/courses/:courseId/sections/:id` | Instructor| 섹션 수정 |
| DELETE | `/courses/:courseId/sections/:id` | Instructor| 섹션 삭제 |

### POST `/courses/:courseId/sections`

**Request**
```json
{ "title": "1장. 파스타 기초 재료", "order": 1 }
```

---

## 6. 강의 단위 (Lectures)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/sections/:sectionId/lectures` | Instructor| 강의 단위 생성 |
| PATCH | `/sections/:sectionId/lectures/:id` | Instructor| 강의 단위 수정 |
| DELETE | `/sections/:sectionId/lectures/:id` | Instructor| 강의 단위 삭제 |
| GET | `/lectures/:id` | Auth| 강의 단위 조회 |

### POST `/sections/:sectionId/lectures`

**Request**
```json
{ "title": "파스타 면 종류 알아보기", "youtubeUrl": "https://www.youtube.com/watch?v=VIDEO_ID", "order": 1, "isPreview": true }
```

> youtubeUrl이 유효하지 않으면 400 Bad Request 반환

---

## 7. 강사 (Instructor)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/instructor/courses` | Auth| 내 강의 목록 조회 |
| GET | `/instructor/courses/:id` | Auth| 내 강의 단건 조회 |
| POST | `/instructor/courses` | Auth| 강의 초안 생성 (DRAFT) |
| PATCH | `/instructor/courses/:id` | Auth| 강의 수정 (DRAFT/REJECTED만 가능) |
| DELETE | `/instructor/courses/:id` | Auth| 강의 삭제 (DRAFT/REJECTED만 가능) |
| PATCH | `/instructor/courses/:id/submit` | Auth| 심의 신청 (DRAFT/REJECTED → PENDING) |

### POST `/instructor/courses`

**Request**
```json
{ "title": "초보자를 위한 파스타", "description": "...", "categoryId": 2, "level": "BEGINNER", "thumbnailUrl": "https://..." }
```

**Response 201**
```json
{ "success": true, "data": { "id": 5, "title": "초보자를 위한 파스타", "status": "DRAFT" } }
```

### PATCH `/instructor/courses/:id/submit` Response

```json
{ "success": true, "data": { "id": 5, "status": "PENDING" } }
```

---

## 8. 강의 시청 진입 (Auto Enrollment)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/enrollments/auto` | Auth| 시청 페이지 첫 진입 시 자동 호출, 이미 존재하면 무시 |

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

## 9. 수강 진도 (Progress)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/progress/complete` | Auth| 강의 단위 완료 처리 |
| GET | `/progress/course/:courseId` | Auth| 강의 진도 조회 |

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

## 10. 마이페이지 (수강 내역)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/enrollments/me` | Auth| 내 수강 강의 목록 및 진도율 |

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

## 11. 리뷰 (Reviews)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/reviews` | Auth| 리뷰 작성 |
| GET | `/reviews?courseId=` | Public| 강의별 리뷰 목록 (페이지네이션) |
| GET | `/reviews/my?courseId=` | Auth| 내 리뷰 조회 (단일 강의) |
| GET | `/reviews/mine` | Auth| 내가 쓴 리뷰 전체 목록 |
| PATCH | `/reviews/:id` | Auth| 리뷰 수정 |
| DELETE | `/reviews/:id` | Auth| 리뷰 삭제 |

### POST `/reviews`

**Request**
```json
{ "courseId": 1, "rating": 5, "content": "정말 유익한 강의였습니다!" }
```

### GET `/reviews` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `courseId` | number | 강의 ID (필수) |
| `page` | number | 페이지 번호 (기본 1) |
| `limit` | number | 개수 (기본 20) |

### GET `/reviews` Response

```json
{
  "success": true,
  "data": {
    "reviews": [
      { "id": 1, "rating": 5, "content": "좋아요!", "user": { "nickname": "요리왕" }, "createdAt": "..." }
    ],
    "avgRating": 4.7,
    "totalCount": 38,
    "page": 1,
    "limit": 20,
    "totalPages": 2
  }
}
```

---

## 12. 관리자 (Admin)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/admin/users` | Admin| 전체 회원 목록 (페이지네이션) |
| GET | `/admin/courses` | Admin| 전체 강의 목록 (상태 필터 가능) |
| PATCH | `/admin/courses/:id/approve` | Admin| 강의 승인 (PENDING → APPROVED) |
| PATCH | `/admin/courses/:id/reject` | Admin| 강의 반려 (PENDING → REJECTED) |

### GET `/admin/users` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `page` | number | 페이지 번호 (기본 1) |
| `limit` | number | 개수 (기본 30) |

### GET `/admin/courses` 쿼리 파라미터

| 파라미터 | 타입 | 설명 |
|----------|------|------|
| `status` | string | DRAFT / PENDING / APPROVED / REJECTED |

### PATCH `/admin/courses/:id/reject`

**Request**
```json
{ "reason": "강의 내용이 플랫폼 가이드라인에 맞지 않습니다." }
```

---

## 13. HTTP 상태 코드

| 코드 | 의미 |
|------|------|
| 200 | 요청 성공 |
| 201 | 리소스 생성 성공 |
| 400 | 잘못된 요청 (유효성 검사 실패, 잘못된 YouTube URL 등) |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 409 | 중복 데이터 충돌 |
| 429 | Rate Limit 초과 |
| 500 | 서버 오류 |
