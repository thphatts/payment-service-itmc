# Component Identification

## Backend (Java Spring Boot)

| Component | Responsibility |
|---|---|
| `AdminController` | REST API for member overview, CSV/Excel import, and manual confirmation. |
| `CampaignController` | Endpoint for generating QR info and handling campaign-specific logic. |
| `OrderController` | REST API for creating and managing PayOS payment links. |
| `WebhookController` | Main endpoint for receiving and verifying PayOS webhooks with security. |
| `PaymentWebhookService` | Core logic for parsing descriptions, database updates, and Redis idempotency. |
| `PayOSConfig` | Spring configuration to initialize the PayOS SDK bean. |
| `SecurityConfig` | Security filters, CSRF/CORS settings, and path permissions. |

## Frontend (React Vite)

| Component | Responsibility |
|---|---|
| `Dashboard.jsx` | Main administrative overview. |
| `FundAdmin.jsx` | Interface for managing campaigns and viewing totals. |
| `Layout.jsx` | Shared navigation sidebar and page wrapper. |
| `Attendance.jsx` | Member attendance tracking (optional/integrated). |
| `App.jsx` | Router configuration and global state. |

## External Dependencies
- **PayOS Java SDK:** Library for payment link creation and verification.
- **Lombok:** Boilerplate reduction (Getters/Setters).
- **Redis:** Used for idempotency check in webhook processing.
- **MySQL:** Main database for user and transaction storage.
