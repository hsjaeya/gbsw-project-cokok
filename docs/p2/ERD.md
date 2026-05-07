# ERD

## 테이블 목록

### users

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| email | String | UNIQUE, NN |
| password | String | NN |
| nickname | String | NN |
| role | Role | NN, DEFAULT STUDENT |
| refresh_token | String | NULL |
| profile_image_url | String | NULL |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> `role`: `STUDENT` \| `INSTRUCTOR` \| `ADMIN`
> `refresh_token`: 로그인 시 저장, 로그아웃 시 null로 초기화

---

### categories

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| name | String | UNIQUE, NN |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

---

### courses

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| title | String | NN |
| description | String | NULL |
| thumbnail_url | String | NULL |
| level | Level | NN, DEFAULT BEGINNER |
| status | CourseStatus | NN, DEFAULT DRAFT |
| rejection_reason | String | NULL |
| category_id | Int | FK(categories.id), NN |
| instructor_id | Int | FK(users.id), NULL |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> `level`: `BEGINNER` \| `ELEMENTARY` \| `INTERMEDIATE` \| `ADVANCED`
> `status`: `DRAFT` \| `PENDING` \| `APPROVED` \| `REJECTED`
> `rejection_reason`: 관리자 반려 시 사유 저장

---

### sections

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| title | String | NN |
| order | Int | NN |
| course_id | Int | FK(courses.id), ON DELETE CASCADE |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

---

### lectures

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| title | String | NN |
| youtube_video_id | String | NN |
| duration_seconds | Int | NULL |
| is_preview | Boolean | NN, DEFAULT false |
| order | Int | NN |
| section_id | Int | FK(sections.id), ON DELETE CASCADE |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> `youtube_video_id`: YouTube URL에서 파싱된 Video ID. 유효하지 않은 URL은 저장 거부.

---

### enrollments

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| user_id | Int | FK(users.id), NN |
| course_id | Int | FK(courses.id), NN |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> UNIQUE(user_id, course_id) — 중복 수강 방지. `upsert`로 원자적 생성.

---

### lecture_progress

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| enrollment_id | Int | FK(enrollments.id), ON DELETE CASCADE |
| lecture_id | Int | FK(lectures.id), ON DELETE CASCADE |
| is_completed | Boolean | NN, DEFAULT false |
| completed_at | DateTime | NULL |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> UNIQUE(enrollment_id, lecture_id)

---

### reviews

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| rating | Int | NN |
| content | String | NULL |
| user_id | Int | FK(users.id), ON DELETE CASCADE |
| course_id | Int | FK(courses.id), ON DELETE CASCADE |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> UNIQUE(user_id, course_id) — 강의당 1인 1리뷰

---

## 관계 요약

- `users` → `enrollments` (1:N)
- `users` → `reviews` (1:N)
- `users` → `courses` (1:N, 강사로서 InstructorCourses)
- `categories` → `courses` (1:N)
- `courses` → `sections` (1:N, CASCADE)
- `courses` → `enrollments` (1:N)
- `courses` → `reviews` (1:N, CASCADE)
- `sections` → `lectures` (1:N, CASCADE)
- `enrollments` → `lecture_progress` (1:N, CASCADE)
- `lectures` → `lecture_progress` (1:N, CASCADE)

---

## p1 대비 변경 사항

| 항목 | p1 | p2 |
|------|----|----|
| Role | STUDENT, ADMIN | STUDENT, INSTRUCTOR, ADMIN |
| Course.status | 없음 | DRAFT / PENDING / APPROVED / REJECTED |
| Course.rejectionReason | 없음 | 추가 |
| Course.instructorId | 없음 | 추가 (강사 FK) |
| reviews 테이블 | 없음 | 추가 |
| refresh_token 저장 | 별도 테이블 | users 컬럼에 직접 저장 |
| password_reset_tokens | 없음 | 없음 |
