# Component Identification

## Backend (Java Spring Boot)

| Component | Responsibility |
|---|---|
| `OrderController` | REST API for creating and managing PayOS orders. |
| `WebhookController` | Endpoint for receiving and verifying PayOS webhooks. |
| `CheckoutController` | Handles server-side Thymeleaf rendering for success/cancel pages. |
| `PaymentWebhookService` | Business logic for parsing descriptions and updating databases. |
| `PayOSConfig` | Spring configuration to initialize the PayOS SDK bean. |
| `SecurityConfig` | Security filters and CSRF/CORS settings. |

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
- **Thymeleaf:** Server-side HTML templates for simple redirects.
- **Lombok:** Boilerplate reduction (Getters/Setters).
