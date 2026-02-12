# Spinfinity Laundry Management System
## Product Roadmap and Milestone Tracker (Reorganized)

Prepared For: Spinfinity Laundry Lounge  
Prepared By: Tekbots Solutions  
Last Updated: 2026-02-12  
Source Inputs:
- `Spinfinity Project Document.pdf` (v2.0, 2026-02-09)
- `Spinfinity Functional Specification.pdf` (v1.0 draft, 2026-02-09)
- Product direction update (2026-02-12): public landing + customer portal + separate staff login

---

## Product Experience Model
### Public (Shop Website)
- Public landing page at `/` for services and pricing.
- Public pickup request form for potential and existing customers.
- Clear split entry points:
  - Customer Login / Sign Up
  - Staff Login (Admin, Staff, Driver)

### Customer Experience
- Customer account creation and login.
- Customer portal for:
  - Profile update (contact + address)
  - Current order status view
  - Previous/completed orders view

### Operations Experience
- Staff login redirects by role:
  - Admin -> `/admin`
  - Staff POS -> `/staff`
  - Driver -> `/driver`
- Branch-aware access controls for staff users.

---

## Current Build Status
- Milestone A (Foundation and Auth): **Done**
- Milestone B (Admin Master Data): **Done (Baseline CRUD)**
- Milestone C (POS Hybrid Invoicing): **Done (Baseline)**
- Milestone D (Public + Customer Scaffolding): **Done (Scaffold)**
- Current focus: **Admin Portal deepening and polishing**

---

## Reorganized Milestones

## Milestone A: Foundation, Auth, and Role Access
### Outcomes
- Supabase + Next.js baseline running.
- Role-based auth with portal redirects in place.
### Deliverables
- Roles: `admin`, `staff`, `driver`, `customer`.
- Auto profile provisioning for new auth users.
- Staff login separated from customer auth.
- Middleware guards by role and branch.
### Status
- Completed.

---

## Milestone B: Admin Master Data (Priority Focus)
### Outcomes
- Admin controls operational master data.
### Deliverables
- Branches CRUD (Buruburu hub, Epren satellite).
- Staff account management.
- Item catalog CRUD.
- Pricing categories and rate-card CRUD.
- Guardrails for active/inactive records.
### Status
- Baseline completed.
### Next Polishing Items
- Better error/success UX.
- Table filtering/search.
- Safer delete/deactivate UX confirmations.
- Validation and audit-friendly change history.

---

## Milestone C: POS Hybrid Invoicing Core
### Outcomes
- Staff can create invoices combining itemized and weighted lines.
### Deliverables
- Invoice builder.
- Server-side pricing validation.
- Totals, discounts, invoice numbering.
- Invoice detail page and downloadable PDF.
### Status
- Baseline completed.
### Next Polishing Items
- Thermal print layout.
- Better receipt branding and formatting.
- Optional customer linking improvements.

---

## Milestone D: Public Site and Customer Portal
### Outcomes
- Public website captures demand and customer accounts.
### Deliverables
- Landing page with services + live pricing.
- Pickup request intake form.
- Customer sign-up/login.
- Customer portal scaffold:
  - Update details
  - Current orders
  - Order history
### Status
- Scaffold completed.
### Next Polishing Items
- Stronger visual design and conversion flow.
- Pickup request triage workflow in admin/staff.
- Customer notifications and portal timeline UI.

---

## Milestone E: Workflow, Inspection, and Delivery
### Outcomes
- End-to-end operational lifecycle is enforced.
### Deliverables
- Status transitions and branch transfer logic.
- Inspection checklist enforcement before completion.
- Hanger loyalty discount integration.
- Driver queue and signature proof of delivery.
### Status
- Pending.

---

## Milestone F: Finance, Inventory, and Controls
### Outcomes
- Financial and stock controls are operational.
### Deliverables
- Revenue channel reconciliation (Cash/M-Pesa/Bank).
- Till/float and deposit confirmation.
- Expense approvals above 5,000 KES.
- Inventory movements (bags, Perchlo, Dirtex).
### Status
- Pending.

---

## Milestone G: Integrations, Compliance, and Launch
### Outcomes
- Communication and audit requirements are production-ready.
### Deliverables
- Africa's Talking SMS.
- Resend email with PDF attachment.
- WhatsApp sharing workflow.
- Exports, invoice archive, immutable audit logs.
- UAT, pilot rollout, training, go-live runbook.
### Status
- Pending.

---

## Delivery Priority From Today
1. Admin portal polish and hardening (Milestone B deepening).
2. Workflow + inspection integration into POS lifecycle.
3. Driver and delivery proof.
4. Finance/inventory controls.
5. Integrations and go-live readiness.
