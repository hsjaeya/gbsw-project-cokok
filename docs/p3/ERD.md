# ERD

## p2에서 유지되는 테이블

p2의 `users`, `categories`, `courses`, `sections`, `lectures`, `enrollments`, `lecture_progress`, `reviews` 테이블은 그대로 유지된다.

---

## p3에서 추가되는 테이블

### payments

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| order_id | String | UNIQUE, NN |
| payment_key | String | UNIQUE, NULL |
| user_id | Int | FK(users.id), ON DELETE CASCADE |
| course_id | Int | FK(courses.id), ON DELETE CASCADE |
| amount | Int | NN |
| status | PaymentStatus | NN, DEFAULT PENDING |
| paid_at | DateTime | NULL |
| refunded_at | DateTime | NULL |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> `status`: `PENDING` \| `PAID` \| `FAILED` \| `REFUNDED`
> `order_id`: 프론트에서 생성하는 주문 고유 ID
> `payment_key`: 토스페이먼츠에서 발급하는 결제 키

---

### subscriptions

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| type | SubscriptionType | NN |
| email | String | NULL |
| discord_webhook_url | String | NULL |
| user_id | Int | FK(users.id), ON DELETE CASCADE, NULL |
| is_active | Boolean | NN, DEFAULT true |
| created_at | DateTime | DEFAULT now() |
| updated_at | DateTime | @updatedAt |

> `type`: `EMAIL` \| `DISCORD`
> `email`: 이메일 구독 시 사용
> `discord_webhook_url`: 디스코드 구독 시 사용
> `user_id`: 로그인 사용자 구독 시 연결, 비회원 이메일 구독은 NULL

---

### webhook_logs

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| target_url | String | NN |
| payload | Json | NN |
| status_code | Int | NULL |
| is_success | Boolean | NN, DEFAULT false |
| retry_count | Int | NN, DEFAULT 0 |
| response_ms | Int | NULL |
| course_id | Int | FK(courses.id), NULL |
| created_at | DateTime | DEFAULT now() |

> `retry_count`: 재시도 횟수 (최대 3)
> `response_ms`: Webhook 응답 시간(ms)

---

### audit_logs

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| admin_id | Int | FK(users.id), NN |
| action | String | NN |
| target_type | String | NN |
| target_id | Int | NULL |
| detail | Json | NULL |
| created_at | DateTime | DEFAULT now() |

> `action`: `COURSE_APPROVE`, `COURSE_REJECT`, `ROLE_CHANGE`, `CATEGORY_DELETE` 등
> `target_type`: `COURSE`, `USER`, `CATEGORY` 등
> `detail`: 변경 전후 값 등 추가 정보

---

### system_logs

| 컬럼 | 타입 | 제약 |
|------|------|------|
| id | Int | PK |
| level | String | NN |
| method | String | NULL |
| url | String | NULL |
| status_code | Int | NULL |
| duration_ms | Int | NULL |
| user_id | Int | NULL |
| message | String | NULL |
| created_at | DateTime | DEFAULT now() |

> 30일 이상 된 레코드는 스케쥴러가 자동 삭제

---

## 추가 Enum

```
enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum SubscriptionType {
  EMAIL
  DISCORD
}
```

---

## 관계 요약 (p3 추가분)

- `users` → `payments` (1:N, CASCADE)
- `courses` → `payments` (1:N, CASCADE)
- `users` → `subscriptions` (1:N, CASCADE)
- `courses` → `webhook_logs` (1:N)
- `users` → `audit_logs` (1:N, admin_id)

---

## p2 대비 변경 사항

| 항목 | p2 | p3 |
|------|----|----|
| payments | 없음 | 추가 (토스페이먼츠 결제) |
| subscriptions | 없음 | 추가 (이메일/디스코드) |
| webhook_logs | 없음 | 추가 (Webhook 발송 이력) |
| audit_logs | 없음 | 추가 (관리자 감사 로그) |
| system_logs | 없음 | 추가 (API 요청 로그) |
| courses 인덱스 | 없음 | status, category_id 인덱스 추가 |
| enrollments 인덱스 | 없음 | user_id 인덱스 추가 |
