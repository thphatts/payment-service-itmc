# Technical Specification

## 1. API Endpoints

### Order Management (`OrderController`)
- `POST /order/create`: Creates a PayOS payment link.
  - Body: `CreatePaymentLinkRequestBody`
- `GET /order/{orderId}`: Retrieves payment information from PayOS.
- `PUT /order/{orderId}`: Cancels a payment link.

### Webhook Handling (`WebhookController`)
- `POST /api/webhook/payment`: Receives payment confirmation from PayOS.
  - **Security:** Requires signature verification via PayOS SDK.

### Admin & Dashboard (`AdminController`)
- `GET /api/v1/admin/dashboard/stats`: Provides aggregated metrics for the dashboard.
- `POST /api/v1/admin/users/import`: Handles multi-format (Excel/CSV) file uploads. Supports `.xlsx`, `.xls`, `.csv`.
- `GET /api/v1/admin/students/overview`: Returns detailed member status and payment history.
- `POST /api/v1/admin/students/confirm-payment`: Manually mark a student as PAID.

## 2. Data Models (Entities)
- **User:** Stores `studentId`, `fullName`, `email`, `role`.
- **Campaign:** Stores `campaignCode`, `amountRequired`, `status` (OPEN/CLOSED).
- **Transaction:** Stores `transactionCode`, `amountPaid`, `status` (SUCCESS/PARTIAL), linked to User and Campaign.

## 3. Security Implementation
- **Signature Verification:** Uses `HMAC-SHA256` via PayOS SDK to verify that webhook data is untampered.
- **CSRF:** Disabled for API endpoints to allow external service (PayOS) interaction.
- **CORS:** Configured to allow requests from the frontend domain.

## 4. Idempotency Logic
1. Webhook receives `transactionId`.
2. Check Redis for `PAYMENT_PROCESSED:{transactionId}`.
3. If exists, skip processing.
4. If not, set key with 30-day TTL and proceed.
