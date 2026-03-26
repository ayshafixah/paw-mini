# Engineering Mini Project Abstract

## Project Title
**Paws — Pet Adoption and Pet Care Commerce Platform**

## Abstract
Paws is a full-stack web application designed as an engineering mini project to digitize pet adoption workflows, pet care operations, and basic pet product commerce in one integrated platform. The system combines role-based user management (user, staff, admin), pet listing and moderation, adoption request processing, shopping cart and order flow, medical record tracking, and in-app notifications. The project demonstrates practical software engineering concepts including modular API design, database schema design, authentication/authorization, and client–server integration with a modern TypeScript-based stack.

The backend is built with **Node.js + Express** in TypeScript and exposes RESTful APIs for authentication, pets, adoptions, shop, cart, orders, medical records, and notifications. Authentication uses JWT tokens, passwords are hashed with bcrypt, and role checks enforce access boundaries for admin/staff-only operations. The database layer uses **SQLite** through `better-sqlite3`, with schema initialization and migration checks handled programmatically.

The frontend is built with **React 19 + Vite + TypeScript**, using **React Router** for client-side routing and **Tailwind CSS v4** for styling. Additional UI/UX libraries include lucide-react icons, motion animations, and sonner toast notifications. The frontend consumes backend APIs via a centralized API client and stores session state in local storage for persistent login behavior.

Overall, this mini project is suitable for demonstrating end-to-end product engineering from local development to deployment packaging, while remaining compact enough for academic evaluation and iterative feature enhancement.

---

## Engineering Problem Statement
Traditional pet adoption handling in small shelters is often manual, fragmented, and difficult to audit. The problem addressed is to provide a unified, digital system that supports:
- transparent pet listing and approval workflows,
- secure user registration and role-based operations,
- structured adoption application tracking,
- basic e-commerce for pet supplies,
- medical record follow-ups and user notifications.

## Objectives
1. Build a multi-role pet platform with secure authentication.
2. Support pet discovery and adoption application lifecycle.
3. Provide admin/staff dashboards for moderation and operations.
4. Integrate pet shop cart and order workflows.
5. Persist all core entities in a relational database.
6. Deliver a deployable, container-friendly project structure.

## Core Feature Modules
- **Authentication & Profile**: signup, login, JWT profile access, profile updates.
- **Pet Management**: listing available pets, submitting pets, admin approval/rejection.
- **Adoption Management**: submit adoption requests, admin review and status updates.
- **Pet Shop**: product listing, admin product CRUD, inventory-aware cart flow.
- **Orders & Payments**: order creation and payment verification (Razorpay integration).
- **Medical Records**: vaccination and due-date entries by staff/admin.
- **Notifications**: user-targeted status and reminder messaging.

## Technology Stack Summary

### Programming Languages
- **TypeScript** (frontend + backend)
- **JavaScript runtime** via Node.js (ES module project)
- **SQL** (SQLite schema and queries)
- **CSS** (Tailwind + custom styles)
- **HTML** (single-page app entry)

### Backend Framework and Server Stack
- **Node.js 20 (LTS) runtime target**
- **Express 4** as backend web framework
- **CORS** and JSON middleware for API interoperability
- **JWT (`jsonwebtoken`)** for authentication tokens
- **bcryptjs** for password hashing
- **Razorpay SDK** for payment order/verification workflow

### Database Connectivity
- **Database**: SQLite
- **Driver/ORM layer**: `better-sqlite3` (direct SQL, no ORM)
- **Connectivity strategy**: file-based DB path from `DATABASE_PATH` env, with fallback to local `paws.db`
- **Schema bootstrap**: auto-created tables at startup (`initDb()`)
- **Migration behavior**: runtime check for missing profile columns (address, phone)

### Frontend Stack
- **React 19**
- **Vite 6** build tooling and dev server
- **React Router DOM 7** for navigation
- **Tailwind CSS 4** + custom design tokens/styles
- **lucide-react** icons
- **motion** animations
- **sonner** toast notifications

### Development Environments
- **Node/npm environment** for local execution
- **TypeScript tooling** (`tsc --noEmit` lint check)
- **tsx** for running TypeScript server directly in development
- **Vite** for frontend build and preview
- **AI Studio + Railway style deployment assumptions** (as referenced by project files and comments)

### Operating System / Deployment OS
- **Primary container base**: `node:20-slim` (Debian slim Linux)
- **Build dependencies in container**: `python3`, `make`, `g++` (required for native module compilation such as SQLite bindings)
- **Cross-platform local support**: any OS supporting Node.js 20+ (Windows/macOS/Linux), with Docker recommended for consistent runtime.

## High-Level Architecture
- **Client Layer**: React SPA renders pages for pets, shop, cart, user dashboard, staff/admin dashboards.
- **API Layer**: Express routes grouped by domain (`/api/auth`, `/api/pets`, `/api/adoptions`, etc.).
- **Security Layer**: Bearer token middleware validates JWT and injects user claims.
- **Data Layer**: SQLite relational tables for profiles, pets, adoptions, products, cart items, orders, order items, medical records, notifications.
- **Integration Layer**: Razorpay payment services.

## Database Entities (Major Tables)
- `profiles`
- `pets`
- `adoptions`
- `products`
- `cart_items`
- `orders`
- `order_items`
- `medical_records`
- `notifications`

## Non-Functional Engineering Characteristics
- **Modularity**: clear separation between frontend API client and backend route handlers.
- **Maintainability**: TypeScript typing for domain entities and API contracts.
- **Security basics**: hashed passwords and protected routes.
- **Scalability baseline**: role-driven workflows and normalized relational entities.
- **Deployability**: Dockerfile-based build/start process.

## Build and Execution Flow (Current Project)
1. Install dependencies with `npm install`.
2. Configure environment variables (`GEMINI_API_KEY`, optional `DATABASE_PATH`).
3. Start server via `npm run dev` (tsx executes backend).
4. Build frontend via `npm run build`.
5. Run production container using Dockerfile (`npm start`).

## Tools and Dependencies Snapshot
- Runtime/Frameworks: Node.js, Express, React, Vite
- Security: bcryptjs, jsonwebtoken
- Database: better-sqlite3
- UI/UX: Tailwind CSS, lucide-react, motion, sonner
- Build/Dev: TypeScript, tsx, autoprefixer

## Limitations (Current State)
- Hardcoded JWT secret and Razorpay test credentials should be moved fully to environment variables.
- SQLite is ideal for mini projects but not horizontally scalable for high concurrency.
- No automated test suite is currently configured.
- Some API and UI error-handling paths can be further hardened.

## Future Scope
- Add unit/integration tests and CI pipeline.
- Introduce refresh token flow and stronger auth/session controls.
- Add analytics dashboard and reporting exports.
- Integrate object storage for pet/product media uploads.
- Migrate from SQLite to PostgreSQL/MySQL for larger deployments.

## Conclusion
This project is an effective engineering mini-project model for demonstrating full-stack development, database-backed workflow automation, and role-based operational control in a real-world inspired domain (pet adoption + pet care commerce). It is technically rich enough for evaluation while remaining compact, understandable, and extensible.
