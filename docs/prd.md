# Product Requirements Document (PRD) - ClubSphere Payment Service

## 1. Project Overview
ClubSphere is a club fund management system designed to automate the process of collecting and tracking member contributions. This service handles the payment gateway integration and financial reconciliation.

## 2. Objectives
- **Automate Collection:** Replace manual bank transfer verification with an automated payment gateway (PayOS).
- **Transparency:** Provide real-time tracking of who has paid and who hasn't.
- **Accuracy:** Use specific transaction content (Student ID + Campaign Code) to match payments correctly.

## 3. Key Features
- **Payment Link Generation:** Create dynamic payment links for club members.
- **Real-time Webhook:** Automatically update transaction status when a payment is completed.
- **Member Management:** Track payments based on Student IDs.
- **Campaign Management:** Organize payments into specific "Campaigns" (e.g., Semester 2 Fund).

## 4. User Flows
1. **Admin** creates a Campaign with a required amount.
2. **Member** visits the payment page, selects the campaign, and enters their Student ID.
3. **System** generates a PayOS link.
4. **Member** completes payment via Bank Transfer (QR Code).
5. **PayOS** sends a Webhook to the backend.
6. **System** verifies the signature and updates the member's payment status.

## 5. Success Metrics
- 0% manual reconciliation for standard payments.
- Webhook processing time < 2 seconds.
- 100% accuracy in signature verification.
