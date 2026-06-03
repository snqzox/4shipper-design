# 4Shipper — Product Overview & App Structure

## What it is

4Shipper is a SaaS platform for shippers and freight forwarders to manage cargo transport across road (primary), air, sea, rail, and intermodal modes.

It sits on the customer side: the party that needs to move cargo and selects from its own carriers, stored in a **Directory**.

## Core flow

1. **Request** — the shipper creates a transport request.
2. **Send** — the request goes out to selected carriers.
3. **Bids** — carriers respond with price quotes.
4. **Award** — the shipper picks the best bid.
5. **Transport** — the awarded bid becomes a live transport.
6. **Track** — the shipper follows the transport through to delivery.

Alongside one-off spot requests, the platform also handles long-term **tenders** and **framework contracts** with agreed price lists (no bidding needed), plus reporting and analytics.

## Two pricing models

| Model | How pricing works | Bidding |
|---|---|---|
| **Spot** | One-off request with a price auction | Yes |
| **Contracted** | Pre-negotiated contract prices (from a tender or framework agreement) | No |

---

# App Structure

## 1. Requests

| # | Screen |
|---|---|
| 1.1 | Requests list |
| 1.2 | New request (wizard) |
| 1.3 | New request with AI |
| 1.4 | Request detail |
| 1.5 | Edit request / draft |

**1.2 New request wizard steps:** Waypoints → Cargo info → Carriers → Overview

**1.3 AI request:** "Extract Shipping Data" modal (upload file / paste text)

**1.4 Request detail:**
- Tabs: Route · Cargo info · Request settings · Documents
- Side panel — Carrier bids: select bid · take back · chat

## 2. Transports

- **Status filters:** All · Canceled · Finished · Processing · Canceled by carrier · Canceled by support
- **Type filters:** All · Spot · Contracted · Evidence-only
- **Actions:** Export · Filters

| # | Screen |
|---|---|
| 2.1 | Transports list |
| 2.2 | Transport detail |

## 3. Tenders

- **Statuses:** Draft · Open (collecting offers) · Evaluation · Finished · Canceled
- **Actions:** Search · Filters · New tender

| # | Screen |
|---|---|
| 3.1 | Tenders list |
| 3.2 | New tender (wizard) |

**3.2 New tender wizard steps:** Tender details → Routes → Pricing categories → Carriers → Overview

## 4. Contracts

- **Filters:** All · Scheduled · Active · Expired · Canceled
- **Actions:** Search · Filters

| # | Screen |
|---|---|
| 4.1 | Contracts list |
| 4.2 | Contract detail |

## 5. Directory

| # | Section | Actions |
|---|---|---|
| 5.1 | Carriers | Create new · Filters |
| 5.2 | Contacts | — |
| 5.3 | Groups | New group |
| 5.4 | Addresses | Create new · Filters |
| 5.5 | Routes | Create new · Filters · Selection mode / Expand |

## 6. Reports

Date range filter · Filters

| # | Tab | Contents |
|---|---|---|
| 6.1 | Overview | KPIs, charts, top countries, top carriers |
| 6.2 | Requests | — |
| 6.3 | Transports | — |
| 6.4 | Carriers | — |
| 6.5 | Routes | — |

## 7. Documents

Central document repository

## 8. Settings

Workspace switcher / add workspace

| # | Section | Actions |
|---|---|---|
| 8.1 | Workspace settings | Company details · Preferences |
| 8.2 | Users | Invite users · Sign-in option |
| 8.3 | Scheduled reports | New scheduled report |
| 8.4 | Vehicle types | Add vehicle |
| 8.5 | Cargo categories | Add cargo category |

## 9. Account / Profile

- 9.1 My profile
- 9.2 Change workspace
- 9.3 Logout

## 10. Other / System

- 10.1 Terms and conditions
- 10.2 Notifications panel + settings
- 10.3 Messages / Chat panel