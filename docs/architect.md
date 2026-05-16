# Architecture Overview

## 1. System Components
- **Frontend:** React + Vite (ClubSphere Dashboard).
- **Backend:** Spring Boot 3.x (Java 17).
- **Database:** MySQL 8 (Permanent storage for Users, Campaigns, Transactions).
- **Cache/Idempotency:** Redis (Ensuring webhooks are not processed twice).
- **Payment Gateway:** PayOS (QR-based banking integration).

## 2. High-Level Flow
```mermaid
sequenceDiagram
    participant Member
    participant Frontend
    participant Backend
    participant PayOS
    participant Database
    participant Redis

    Member->>Frontend: Select Campaign & Enter ID
    Frontend->>Backend: POST /order/create
    Backend->>PayOS: Generate Payment Link
    PayOS-->>Backend: checkoutUrl
    Backend-->>Frontend: data.checkoutUrl
    Frontend->>Member: Redirect to PayOS

    Member->>PayOS: Scan QR & Pay
    PayOS->>Backend: POST /api/webhook/payment (Sign)
    
    rect rgb(200, 230, 255)
    Note over Backend,Redis: Idempotency Check
    Backend->>Redis: SETNX transactionId
    end

    rect rgb(230, 255, 230)
    Note over Backend,PayOS: Verification
    Backend->>Backend: Verify Signature (Checksum Key)
    end

    Backend->>Database: Update Transaction & User Status
    Backend-->>PayOS: 200 OK
```

## 3. Deployment
- **Docker:** Multi-container setup (Backend, Frontend, MySQL, Redis).
- **Environment Variables:** Used for sensitive keys (DB passwords, PayOS keys).
