# CloudMojo CMT HRMS Suite 🚀

A premium, comprehensive Human Resource Management System (HRMS) inspired by the core features, logical workflows, and executive user experience of CMT HR.

Built with **React (Vite) + Tailwind CSS + Lucide Icons + Recharts** on the frontend, and a **Node.js Express + Prisma PostgreSQL** backend with automatic seed JSON file database fallbacks.

---

## 🌟 Key Product Features

### 1. Core HR & Directory
* **Self-Service Directory**: Search, filter, and detail personnel cards.
* **Sensitive Salary Control**: Salary details are automatically padlocked and restricted from normal Employees, showing only to ORG_ADMIN and MANAGERS.
* **Dynamic Custom Form Fields**: Dynamic profile attributes (e.g. T-Shirt sizes) built in the system are immediately appended to employee profiles.
* **Interactive Org Reporting Tree**: Clean parent-subordinate relational cards showing corporate trees.
* **Personnel Document Vaults**: Upload and download contract PDFs, offer letters, and ID proofs.

### 2. Time & Shift Attendance
* **Digital Check-In Widget**: Quick clock-in / clock-out buttons with simulation coordinates presets.
* **Available Leaves Quotas**: Sick (10) and Annual (15) dials recalculated on-the-fly.
* **Sequential Approval Flow**: Leave applications trigger automated email notification transaction console logs, routing from Employee ➔ Manager Approval ➔ HR Approval ➔ Balance quota deduction.
* **Project Timesheets**: Fill daily logs, project titles, and task summaries for manager timesheet audits.

### 3. Hiring & Onboarding Checks
* **Careers Job Board**: Create and post job requisitions.
* **Applicants Kanban Board**: Drag-and-drop candidates pipeline (New ➔ Interviewed ➔ Hired ➔ Rejected).
* **Onboarding Checklist Checkboxes**: Collaborative checklist tracks task states (IT laptop provisions, HR contract signatures, Facilities badge keys) for HIRED personnel.
* **Resignation Exit Clearances**: Request exit separations, schedule exit interviews, and track IT device return status checklists.

### 4. Appraisals & OKRs
* **OKR Goals Sliders**: Current vs. Target metrics with approval workflows.
* **Appraisal Reviews**: Annual self-reviews and manager evaluations with rating scales from 1 to 5.
* **Scorecard PDF Exporter**: Download appraisal summaries with milestone confetti celebrations.

### 5. Employee Experience
* **Company Notice Feeds**: Bulletins notices where employees can like notices and write comments.
* **Help Desk ticketing**: Raise IT/HR cases, complete with priority indicators and resolution message threads.
* **FAQ AI Chatbot**: Interactive chatbot answering queries about leave balances, corporate holidays, and handbook travel policies.

---

## 🔑 Pre-seeded Testing Accounts
Use these pre-seeded profiles to test distinct workspace roles (the seed password for all fallback accounts is `password123`):

| Role / Designation | Corporate Email | Context / Capabilities |
| :--- | :--- | :--- |
| **Org Administrator** | `admin@cloudmojo.tech` | System tools control, dynamic fields creator, salary audits. |
| **Team Manager** | `sarah.manager@cloudmojo.tech` | Approves leave requests, grades team appraisal reviews. |
| **HR Specialist** | `jane.hr@cloudmojo.tech` | Job board creation, applicant pipeline hiring, onboarding. |
| **Standard Employee** | `john.dev@cloudmojo.tech` | Clock shifts, apply for leaves, raise IT support tickets. |

---

## 🛠️ Step-by-Step Local Setup

### Prerequisite Checklist
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL** *(Optional)*: Set up local PostgreSQL, or let the app automatically fallback to the local `mock_db.json` database.

---

### 1. Backend Server Setup

1. **Navigate to backend folder**:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment Variables**:
   Create a `.env` file inside `backend/` with the following variables:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cmt_hr_app?schema=public"
   JWT_SECRET="super-secret-key-signature-string-value"
   JWT_REFRESH_SECRET="super-secret-refresh-key-signature-string-value"
   ```
4. **Prisma DB Sync & Seed** *(If using PostgreSQL)*:
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *(If database is disconnected, the server automatically boots on the resilient JSON-flat DB file)*.
5. **Run Tests**:
   ```bash
   npm test
   ```
6. **Start Dev Server**:
   ```bash
   npm run dev
   ```

---

### 2. Frontend Client Setup

1. **Navigate to frontend folder**:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Start Client Server**:
   ```bash
   npm run dev
   ```
4. **Access Portal**: Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📐 Architecture & Extensions Flow
```mermaid
graph TD
    A[Vite React Frontend] -->|Axios API Gateway Proxy| B[Express Gateway Middleware]
    B -->|RBAC + JWT Guard| C[App API Router]
    C --> D[Prisma Client PostgreSQL]
    C -->|Auto Fallback try-catch| E[mockDb JSON Flat File Service]
    D --> F[Database Record Store]
    E --> G[mock_db.json Seed Store]
```

To create additional profile form fields, navigate to **System Tools** inside the admin portal, define a new attribute, and save. The builder registers the variable and injects it into both employee creation templates and personnel detail vault panels dynamically!