# Spinfinity Laundry Management System
## Build Plan and Milestone Tracker (Next.js + Supabase)

Prepared For: Spinfinity Laundry Lounge  
Prepared By: Tekbots Solutions  
Last Updated: 2026-02-11  
Source of Truth Inputs:
- `Spinfinity Project Document.pdf` (v2.0, 2026-02-09)
- `Spinfinity Functional Specification.pdf` (v1.0 draft, 2026-02-09)

---

## Current Status Check (Codebase vs Milestone 1)
Milestone 1 is **not completed**.

Evidence from current repo:
- `src/app/page.tsx` is still the default Next.js starter page.
- No sign-in page/routes implemented.
- No role tables or RBAC implementation found.
- No Admin/Staff/Driver portal shell routes found.
- Supabase client exists (`src/lib/supabase/client.ts`) but no auth flow usage is wired.

Milestone 1 completion score: **0/5 required deliverables complete**.

---

## Product Scope (Consolidated from Both Documents)
The system must support:
- Three portals: Admin, Staff POS, Driver.
- Two-branch operating model: Buruburu (processing hub) and Epren (collection satellite).
- Hybrid pricing in one invoice (itemized + weight-based).
- Mandatory garment inspection before invoice finalization.
- Hanger loyalty discount (1 KES per hanger).
- Workflow lifecycle from order reception to closure, including Epren-to-Buruburu transfer logic.
- Driver delivery workflow with proof of delivery signature.
- Finance reconciliation by payment channel and cash-in-hand clearing.
- Expense approvals for amounts above 5,000 KES.
- Inventory for retail assets (bags) and consumables (Perchlo/Dirtex; Buruburu-only issuance).
- Integrations: SMS (Africa's Talking), Email (Resend + PDF attachment), and WhatsApp invoice sharing.
- Compliance: exports (Excel/PDF), searchable invoice archive, audit readiness.

---

## Milestone Plan with Acceptance Criteria

## Milestone 0: Project Setup and Architecture
### Outcomes
- Next.js + Supabase environments are operational.
- Data model baseline and security model are agreed.
### Deliverables
- App Router project initialized and running.
- Supabase project and local CLI setup.
- `.env.local` and deployment environment variable matrix documented.
- Initial ERD covering users, roles, branches, customers, orders, payments, inventory, expenses, audit logs.
### Acceptance Criteria
- App boots locally with Supabase connection.
- ERD reviewed and approved.

---

## Milestone 1: Authentication, Roles, and Portal Shells (Critical Path)
### Outcomes
- Secure sign-in works.
- Portal access is role-scoped (Admin, Staff, Driver).
- Branch-aware access controls are defined and enforceable.
### Deliverables
- Auth pages: sign in, sign out, session handling.
- Role model: role assignment and branch assignment.
- Portal shells:
  - Admin Portal shell
  - Staff POS shell
  - Driver Portal shell
- Route guards/middleware for RBAC.
- Basic nav/layout per portal.
### Acceptance Criteria
- Admin cannot access Driver-only pages unless role changed.
- Staff records are restricted to assigned branch context.
- Driver only sees delivery-relevant modules.

---

## Milestone 2: Master Data (Admin)
### Outcomes
- Admin controls master setup for operations.
### Deliverables
- CRUD: branches (Buruburu, Epren), staff accounts, item catalog, pricing categories/rates.
- Pricing supports per-item and per-kg schemas.
### Acceptance Criteria
- Staff POS can only select active admin-defined items/rates.

---

## Milestone 3: Hybrid Costing Engine and Receipt Generation (Core)
### Outcomes
- One receipt can mix itemized and weighted lines.
### Deliverables
- Invoice/POS builder.
- Server-side pricing validation and totals.
- Discounts support (including hanger discount hook from Milestone 5).
- Invoice numbering and status initialization.
- Receipt templates:
  - Thermal print format
  - PDF invoice generation
### Acceptance Criteria
- Calculations match configured rate cards exactly.
- PDF invoice generation works for finalized orders.

---

## Milestone 4: Workflow and Inter-Branch Lifecycle (Core)
### Outcomes
- End-to-end order state progression is traceable.
### Deliverables
- Status engine:
  - Received
  - In Transit (Epren -> Buruburu)
  - Processing
  - Washed
  - Ready
  - Dispatched
  - Completed/Closed
- Branch transfer flag logic for Epren-originated orders.
- Status audit trail with timestamp and actor.
### Acceptance Criteria
- Lifecycle history is queryable per order.

---

## Milestone 5: Inspection and Loyalty (Core)
### Outcomes
- Inspection is mandatory before invoice completion.
### Deliverables
- Inspection checklist (tears, discoloration, stains, missing buttons).
- Enforcement rule to block completion if inspection not captured.
- Hanger loyalty discount (1 KES per returned hanger).
- Inspection details on invoice/receipt record.
### Acceptance Criteria
- User cannot finalize order without inspection fields.

---

## Milestone 6: Driver Logistics and Proof of Delivery (Core)
### Outcomes
- Driver executes delivery with digital proof.
### Deliverables
- Driver queue for ready/dispatched orders.
- Order view including customer location/contact.
- Delivery confirmation with signature capture.
### Acceptance Criteria
- Delivered orders store signature and delivery timestamp.

---

## Milestone 7: Finance and Expense Control (Core)
### Outcomes
- Daily funds and expenses can be reconciled.
### Deliverables
- Revenue split by channel (Cash, M-Pesa, Bank).
- Till/float and cash-in-hand tracking.
- Deposit confirmation workflow.
- Expense workflow with threshold approvals (> 5,000 KES).
- Expense categories: rent, salaries, internet, maintenance (extensible).
### Acceptance Criteria
- End-of-day branch reconciliation report can be generated.

---

## Milestone 8: Inventory Management (Add-On)
### Outcomes
- Stock movement is visible and controlled.
### Deliverables
- Retail bags inventory (batch-based; sale deducts stock).
- Consumables issuance in liters (Perchlo, Dirtex; Buruburu only).
- Stock movement logs and low-stock alerts/views.
- Stock transfer request + approval support in Admin.
### Acceptance Criteria
- POS bag sale decrements inventory automatically.

---

## Milestone 9: Integrations and Notifications
### Outcomes
- Customers receive timely operational notifications.
### Deliverables
- Africa's Talking SMS integration.
- Resend email integration with PDF attachment.
- WhatsApp invoice sharing workflow (provider to be confirmed).
- Trigger events:
  - Order received
  - Washing complete / ready for pickup
  - Order dispatched (include driver context where available)
- Delivery log, retry strategy, failure visibility.
### Acceptance Criteria
- Triggered events are logged with success/failure status.

---

## Milestone 10: Compliance, Exports, and Auditability
### Outcomes
- Data is audit-ready and searchable.
### Deliverables
- Excel/PDF exports: sales, expenses, inventory, reconciliation.
- Searchable invoice archive.
- Immutable audit logs for critical actions.
### Acceptance Criteria
- Historical records are exportable without data loss.

---

## Milestone 11: UAT, Pilot, and Go-Live
### Outcomes
- Controlled rollout with operational readiness.
### Deliverables
- UAT scripts and pass criteria per portal.
- Pilot rollout: Buruburu first, then Epren.
- Staff training and handover guides.
- Bug-fix rounds and post-launch backlog.
### Acceptance Criteria
- UAT sign-off and go-live checklist approved.

---

## Requirements Coverage Matrix (PDF -> Milestones)
- Portals and RBAC -> M1
- Master Data (items, pricing, staff, branches) -> M2
- Hybrid costing and invoices -> M3
- Workflow/inter-branch logic -> M4
- Inspection + hanger loyalty -> M5
- Driver delivery/signature -> M6
- Finance reconciliation + expense approvals -> M7
- Inventory (bags + consumables) -> M8
- SMS/Email/WhatsApp integrations -> M9
- Exports, archive, auditability -> M10
- Pilot and training -> M11
