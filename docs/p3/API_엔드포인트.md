# API 엔드포인트

> p2에서 정의된 엔드포인트는 그대로 유지된다. 이 문서는 p3에서 추가되는 엔드포인트만 기술한다.

---

## 공통

- Base URL: `/api`
- 인증: `Authorization: Bearer <accessToken>` (Auth 표시 항목)
- 관리자 전용: `Auth + ADMIN 역할` (Admin 표시 항목)

---

## 결제 (Payments)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/payments/confirm` | Auth | 결제 확인 및 검증 |
| GET | `/payments/my` | Auth | 내 결제 내역 조회 |
| GET | `/payments` | Admin | 전체 결제 내역 조회 |
| POST | `/payments/:id/refund` | Admin | 결제 환불 처리 |

### POST `/payments/confirm`

결제 완료 후 서버에서 토스페이먼츠 API로 검증하고 수강 이력을 생성한다.

**Request Body**
```json
{
  "paymentKey": "string",
  "orderId": "string",
  "amount": 10000
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "orderId": "order_123",
    "status": "PAID",
    "amount": 10000,
    "paidAt": "2026-06-12T09:00:00Z"
  }
}
```

### GET `/payments/my`

**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "orderId": "order_123",
      "status": "PAID",
      "amount": 10000,
      "paidAt": "2026-06-12T09:00:00Z",
      "course": {
        "id": 1,
        "title": "파스타 입문"
      }
    }
  ]
}
```

### POST `/payments/:id/refund`

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "REFUNDED",
    "refundedAt": "2026-06-12T10:00:00Z"
  }
}
```

---

## 구독 (Subscriptions)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/subscriptions/email` | Public | 이메일 구독 등록 |
| DELETE | `/subscriptions/email` | Public | 이메일 구독 해지 |
| POST | `/subscriptions/discord` | Auth | 디스코드 Webhook 구독 등록 |
| DELETE | `/subscriptions/discord` | Auth | 디스코드 구독 해지 |
| GET | `/subscriptions/my` | Auth | 내 구독 목록 조회 |

### POST `/subscriptions/email`

**Request Body**
```json
{
  "email": "user@example.com"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "type": "EMAIL",
    "email": "user@example.com",
    "isActive": true
  }
}
```

### DELETE `/subscriptions/email`

**Request Body**
```json
{
  "email": "user@example.com"
}
```

### POST `/subscriptions/discord`

**Request Body**
```json
{
  "discordWebhookUrl": "https://discord.com/api/webhooks/..."
}
```

---

## Webhook 로그 (Admin)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/admin/webhook-logs` | Admin | Webhook 발송 이력 조회 |

### GET `/admin/webhook-logs`

**Query Parameters**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `isSuccess` (boolean, optional)

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "targetUrl": "https://...",
        "isSuccess": true,
        "statusCode": 200,
        "retryCount": 0,
        "responseMs": 120,
        "createdAt": "2026-06-12T09:00:00Z"
      }
    ],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

---

## 감사 로그 (Admin)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/admin/audit-logs` | Admin | 감사 로그 조회 |

### GET `/admin/audit-logs`

**Query Parameters**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `action` (string, optional): `COURSE_APPROVE`, `COURSE_REJECT`, `ROLE_CHANGE`, `CATEGORY_DELETE`

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "action": "COURSE_APPROVE",
        "targetType": "COURSE",
        "targetId": 5,
        "detail": { "courseTitle": "파스타 입문" },
        "admin": { "id": 1, "nickname": "관리자" },
        "createdAt": "2026-06-12T09:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

---

## 헬스체크 (Health)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| GET | `/health` | Public | 서버 및 DB 상태 확인 |

### GET `/health`

**Response (정상)**
```json
{
  "status": "ok",
  "info": {
    "database": { "status": "up" }
  }
}
```

**Response (이상)**
```json
{
  "status": "error",
  "error": {
    "database": { "status": "down", "message": "연결 실패" }
  }
}
```

---

## 스케쥴러 수동 실행 (Admin)

| 메서드 | 경로 | 권한 | 설명 |
|--------|------|------|------|
| POST | `/admin/scheduler/weekly-summary` | Admin | 주간 강의 요약 메일 수동 실행 |
| POST | `/admin/scheduler/inactive-reminder` | Admin | 수강 독려 메일 수동 실행 |
| POST | `/admin/scheduler/cleanup-logs` | Admin | 오래된 로그 정리 수동 실행 |
