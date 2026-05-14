# Product Requirements Document

## Project Overview

**Project Name**: Auto Log Transaction
**Owner**: Vincent
**Status**: 🟡 In Development

---

## Problem Statement
Manually tracking and logging bank transactions from emails into a spreadsheet is time-consuming and prone to human error. There is a need for an automated system that polls the inbox, extracts transaction details, and logs them into a cloud-based spreadsheet (Google Sheets) in near real-time.

---

## Target Users
- Personal finance trackers
- Small business owners monitoring bank movements
- Anyone needing automated transaction logging from email notifications.

---

## Success Metrics

| Metric | Target |
|--------|--------|
| [Metric] | [Target] |

---

## Features

### Feature 1: Email Polling & Parsing
**Status**: ⚪ Not Started
**Priority**: P1

**Description**: Automatically connect to an email inbox (via IMAP or API) every 3-4 minutes to check for new transaction notifications. Parse the email body to extract:
- Date
- Amount
- Transaction Message/Description

**Acceptance Criteria**:
- [ ] Successful connection to email provider
- [ ] Identification of specific bank transaction emails (filtering)
- [ ] Accurate extraction of amount and date via regex or LLM
- [ ] Prevention of duplicate logs (idempotency)

### Feature 2: Cloud Spreadsheet Integration
**Status**: ⚪ Not Started
**Priority**: P1

**Description**: Log the extracted data into a Google Sheet (Cloud Excel).

**Acceptance Criteria**:
- [ ] Connect to Google Sheets API
- [ ] Append new row for each transaction
- [ ] Format data correctly (Currency, Dates)

---

## Out of Scope
- Direct bank API integration (using email as the source)
- Complex category classification (for now)
- Multiple bank support (initially focusing on one format)

---

## Open Questions

- [ ] [Question 1]
