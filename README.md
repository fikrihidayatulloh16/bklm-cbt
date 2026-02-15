# 🚀 School Counselor Assessment SaaS Platform

> **Status:** Production Ready (Self-Hosted on Proxmox) | **Role:** Lead Fullstack Engineer

An automated assessment platform designed to replace manual Excel/Google Form workflows for School Counselors. Built with **Clean Architecture** principles to ensure scalability, maintainability, and performance.

![NestJS](https://img.shields.io/badge/backend-NestJS-red) ![Next.js](https://img.shields.io/badge/frontend-Next.js-black) ![Redis](https://img.shields.io/badge/cache-Redis-red) ![Docker](https://img.shields.io/badge/infra-Docker-blue) ![AWS](https://img.shields.io/badge/certified-AWS_CCP-orange)

## 📖 Table of Contents
- [The Problem & Solution](#-the-problem--solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Quick Cheatsheet](#-quick-cheatsheet)
- [Developer Guide (Getting Started)](#-developer-guide-getting-started)
- [Deployment](#-deployment)

---

## 🎯 The Problem & Solution

**The Bottleneck:**
Counselors were manually processing 1,500+ data points per exam session (30 students x 50 questions) using Excel and Google Forms. This led to high administrative burnout, data entry errors, and delayed reporting.

**The Solution:**
I engineered a dedicated SaaS platform that automates the entire lifecycle:
1.  **Input:** Students take exams via a real-time interface.
2.  **Process:** System auto-grades and aggregates data instantly using **PostgreSQL**.
3.  **Output:** Counselors generate complex Excel reports with one click.

**Impact:** Reduced administrative workload by **90%** and provided real-time insights into student performance.

---

## ✨ Key Features

* **Real-Time Monitoring:** Counselors can watch student progress live (powered by **WebSockets**).
* **Hybrid Caching Strategy:** Uses **Redis** for session management and frequently accessed exam data to reduce DB load.
* **Bulk Import/Export:** Robust Excel parsing (SheetJS) handled in the backend queue to prevent timeout.
* **Role-Based Access Control (RBAC):** Secure separation between Admin, Counselor, and Student roles.

---

## 🏗 System Architecture

This project is structured as a **Monorepo**, separating concerns between the Client (Next.js) and Server (NestJS) while sharing configuration and type definitions.

- **Backend Strategy: Modular Monolith**
The API follows a **Module-based Architecture** where each business domain (Auth, Assessment, Users) is encapsulated in its own module containing specific logic, controllers, and services.

- **Frontend Strategy: Feature-Sliced Design**
The frontend utilizes Next.js App Router organized by **Features**, ensuring that UI components and logic related to a specific domain (e.g., Exam, Dashboard) remain co-located.

```text
.
├── apps/
│   ├── api/                  # NestJS Backend Service
│   │   ├── prisma/           # Database Schema & Migrations
│   │   ├── src/
│   │   │   ├── auth/         # Authentication (Guards, Strategies)
│   │   │   ├── assessment/   # Assessment Business Logic
│   │   │   ├── question-bank/# Question Management Module
│   │   │   ├── users/        # User Management
│   │   │   └── main.ts       # Entry Point
│   │   └── test/             # E2E Testing
│   │
│   └── web/                  # Next.js Frontend Application
│       ├── app/              # App Router (Pages & Layouts)
│       ├── features/         # Feature-Specific Components (Dashboard, Exam)
│       ├── components/ui/    # Shared Reusable UI (Shadcn)
│       ├── lib/              # Shared Utilities & Socket Configuration
│       └── middleware.ts     # Edge Middleware for Route Protection
│
├── monitoring/               # Promtail & Logging Configuration
├── docker-compose.yml        # Infrastructure Orchestration
└── ecosystem.config.js       # PM2 Process Manager Config
```

## 🛠 Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | NestJS (TypeScript), Prisma ORM |
| **Frontend** | Next.js 14 (App Router), Tailwind CSS, NextUI |
| **Database** | PostgreSQL |
| **Caching/Queue** | Redis, TanStack Query |
| **Infrastructure** | Docker Compose, Cloudflare Tunnels |
| **DevOps** | GitHub Actions (CI), Proxmox VE (Self-hosted Production) |

## ⚡ Quick Cheatsheet

### 1. Infrastructure Setup
Duplicate the example env file before starting anything:
```bash
cp .env.example .env
# ⚠️ Don't forget to fill in DATABASE_URL and REDIS_HOST inside .env
```

Start Database & Redis services:
```bash
docker-compose up -d
```

### 2. Database (Prisma)
Navigate to `apps/api/prisma` (or root depending on config):
```bash
# Generate Prisma Client
npx prisma generate

# Run Migration (Development)
npx prisma migrate dev --name init
```

### 3. Backend (NestJS)
```bash
cd apps/api
npm install
npm run start:dev
```

### 4. Frontend (Next.js)
```bash
cd apps/web
npm install
npm run dev
```

### 5. Common Commands
```bash
# View Data (GUI)
npx prisma studio

# Stop Infrastructure
docker-compose down
```

---

## ⚡ Developer Guide (Getting Started)
For future reference: How to run this project locally.


### 1. Prerequisites
- Node.js >= 20.x
- Docker & Docker Compose (Required for DB & Redis)
- pnpm or npm

### 2. Environment Setup
Copy the example env file:

```Bash
cp .env.example .env
# Update DATABASE_URL and REDIS_HOST inside .env
```

### 3. Start Infrastructure (DB & Redis)
Don't install Postgres manually. Use the docker-compose file:

```Bash
# Starts Postgres and Redis in background
docker-compose up -d
```

### 4. Database Migration
Sync the Prisma schema with the Docker database:

```Bash
npx prisma migrate dev --name init
```

### 5. Run the Application
Run Backend (NestJS):

```Bash
# Watch mode (Hot Reload)
npm run start:dev

# Production build test
npm run build && npm run start:prod
```

Run Frontend (Next.js):

```Bash
cd frontend
npm run dev
```
  
## 🚀 Deployment

This project uses **GitHub Actions** for CI/CD deployments to a self-hosted Proxmox environment.

### How to Trigger Deployment (Manual)
1.  **Sync:** Push your latest commits to the GitHub repository.
2.  **Navigate:** Go to the **Actions** tab in the repository.
3.  **Select Workflow:** Click **"Monorepo Self-Hosted Deploy"** on the left sidebar.
4.  **Run:** Click the **"Run workflow"** dropdown button -> Select **Run workflow**.
5.  **Status:** The deployment pipeline will initiate automatically.

>The production version is currently self-hosted on a Proxmox Home Lab utilizing LXC containers for efficiency.

> **Production Note:** The app runs on **Proxmox LXC Containers** exposed securely via **Cloudflare Tunnels** (Zero Trust) to avoid opening public ports.
