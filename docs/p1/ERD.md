# ERD

## 테이블 목록

### users

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| email | String | NN |
| password | String | NN |
| nickname | String | NN |
| profile_image | String | - |
| role | String | NN |
| created_at | DateTime | - |
| updated_at | DateTime | - |

---

### categories

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| name | String | NN |
| slug | String | NN |
| created_at | DateTime | - |

---

### courses

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| category_id | Int | FK, NN |
| title | String | NN |
| description | String | - |
| thumbnail_url | String | - |
| level | String | NN |
| created_at | DateTime | - |
| updated_at | DateTime | - |

---

### sections

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| course_id | Int | FK, NN |
| title | String | NN |
| order | Int | NN |
| created_at | DateTime | - |

---

### lectures

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| section_id | Int | FK, NN |
| title | String | NN |
| youtube_url | String | NN |
| youtube_video_id | String | NN |
| duration_seconds | Int | - |
| order | Int | NN |
| is_preview | Boolean | NN |
| created_at | DateTime | - |

---

### enrollments

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| user_id | Int | FK, NN |
| course_id | Int | FK, NN |
| enrolled_at | DateTime | - |

---

### lecture_progress

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| user_id | Int | FK, NN |
| lecture_id | Int | FK, NN |
| enrollment_id | Int | FK, NN |
| is_completed | Boolean | NN |
| completed_at | DateTime | - |
| created_at | DateTime | - |

---

### refresh_tokens

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| user_id | Int | FK, NN |
| token | String | NN |
| expires_at | DateTime | NN |
| created_at | DateTime | - |

---

## 관계 요약

- `users` → `enrollments` (1:N)
- `users` → `lecture_progress` (1:N)
- `users` → `refresh_tokens` (1:N)
- `categories` → `courses` (1:N)
- `courses` → `sections` (1:N)
- `courses` → `enrollments` (1:N)
- `sections` → `lectures` (1:N)
- `lectures` → `lecture_progress` (1:N)
- `enrollments` → `lecture_progress` (1:N)
