# Project Notes & Troubleshooting

## 1. Student ID Validation
The system expects Student IDs in a specific format (e.g., N21DCCN001). 
Regex used: `[A-Z]\d{2}[A-Z]{2,5}\d{2,4}`
- Case insensitive in matching.
- Automatically converted to Uppercase before database lookup.

## 2. Environment Variables
Ensure the following variables are set in your deployment environment:
- `DB_PASSWORD`: MySQL root password.
- `REDIS_PASSWORD`: Redis authentication.
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`: Provided by PayOS Dashboard.
- `WEBHOOK_SECRET`: Secret key for custom webhook verification logic (if needed).

## 3. Common Issues
- **Webhook Not Received:** Check if the server is accessible from the internet (e.g., using Ngrok for local testing).
- **Signature Failure:** Ensure `PAYOS_CHECKSUM_KEY` is correct and matches the environment (Sandbox vs Production).
- **CORS Errors:** Update `SecurityConfig.java` if the frontend URL changes.

## 4. Database Seeding
The application automatically seeds a default campaign `CAMP01` on startup if it doesn't exist (see `PaymentServiceApplication.java`).
