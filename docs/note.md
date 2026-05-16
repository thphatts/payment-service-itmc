# Project Notes & Troubleshooting

## 1. Student ID Validation
The system is now more flexible with Student IDs to support testing.
- **New Regex:** `^[A-Z0-9]{3,15}$` (Case insensitive).
- Supports both standard IDs (e.g., N23DCCN204) and simple test IDs (e.g., SV001).
- Automatically converted to Uppercase before database lookup.

## 2. Excel Import Specifications
- **Supported Formats:** `.xlsx`, `.xls`, `.csv`.
- **Auto-Detection:** The system automatically identifies columns based on content.
- **Headers:** It intelligently skips rows containing header keywords like "STT", "Họ tên", "MSSV", etc.
- **Requirement:** At least a "Student ID" and "Full Name" must be present in the row for successful import.

## 3. Environment Variables
Ensure the following variables are set in your deployment environment:
- `DB_PASSWORD`: MySQL root password.
- `REDIS_PASSWORD`: Redis authentication.
- `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`: From PayOS Dashboard.
- `WEBHOOK_SECRET`: Secret key for custom webhook verification.

## 4. Common Issues
- **Excel Parsing Error:** Ensure the file is not corrupted and follows a basic tabular structure.
- **Webhook Not Received:** Check internet exposure (e.g., Ngrok) for local dev.
- **CORS Errors:** Verify the `SecurityConfig.java` allows your frontend's origin.

## 5. Database Seeding
The application seeds a default campaign `CAMP01` on startup if it doesn't exist (see `PaymentServiceApplication.java`).
