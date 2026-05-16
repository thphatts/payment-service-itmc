# Webhook Documentation (PayOS)

## 1. Webhook Configuration
The webhook URL should be configured in the PayOS Dashboard as:
`https://your-domain.com/api/webhook/payment`

## 2. Payload Structure
PayOS sends a JSON payload with a `data` object and a `signature`.

```json
{
  "code": "00",
  "desc": "success",
  "data": {
    "orderCode": 123456,
    "amount": 100000,
    "description": "QUYCLB N21DCCN001 CAMP01",
    "reference": "PAYOS12345",
    "status": "PAID",
    ...
  },
  "signature": "abcdef123456..."
}
```

## 3. Verification Process
In `WebhookController`, we use the PayOS SDK:
```java
vn.payos.type.WebhookData webhookData = payOS.verifyPaymentWebhookData(payload);
```
- If verification fails: SDK throws an `Exception`.
- If verification succeeds: Returns `WebhookData` for processing.

## 4. Content Parsing
We use Regex to extract information from the `description` field:
- Pattern: `QUYCLB\\s+([A-Z]\\d{2}[A-Z]{2,5}\\d{2,4})\\s+([A-Z0-9]+)`
- Group 1: Student ID (e.g., N21DCCN001)
- Group 2: Campaign Code (e.g., CAMP01)

## 5. Failure Handling
If the backend returns anything other than `2xx`, PayOS will retry the webhook multiple times. It is crucial to handle idempotency using Redis to avoid duplicate balance updates.
