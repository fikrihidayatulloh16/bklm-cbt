# 🚀 School Counselor Assessment SaaS Platform

> **Status:** Production Ready (Self-Hosted on Proxmox) | **Role:** Lead Fullstack Engineer

An automated assessment platform designed to replace manual Excel/Google Form workflows for School Counselors. Built with **Clean Architecture** principles to ensure scalability, maintainability, and performance.

![NestJS](https://img.shields.io/badge/backend-NestJS-red) ![Next.js](https://img.shields.io/badge/frontend-Next.js-black) ![Redis](https://img.shields.io/badge/cache-Redis-red) ![Docker](https://img.shields.io/badge/infra-Docker-blue) ![AWS](https://img.shields.io/badge/certified-AWS_CCP-orange)

## 📖 Table of Contents
- [The Problem & Solution](#-the-problem--solution)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [⚡ Developer Guide (Getting Started)](#-developer-guide-getting-started)
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

This project follows **Domain-Driven Design (DDD)** and **Clean Architecture** to decouple business logic from frameworks.

```text
src/
├── application/      # Use Cases (Business Logic)
├── domain/           # Entities & Interfaces (Pure TS, no framework dependencies)
├── infrastructure/   # Database, External APIs (Implementation of interfaces)
├── presentation/     # Controllers, Resolvers (HTTP/GraphQL layers)
└── main.ts           # Entry point
```

## 🛠 Tech Stack

Layer,Technology
Backend,"NestJS (TypeScript), Prisma ORM"
Frontend,"Next.js 14 (App Router), Tailwind CSS, Shadcn UI"
Database,PostgreSQL 16
Caching/Queue,Redis
Infrastructure,"Docker Compose, Nginx Reverse Proxy, Cloudflare Tunnels"
DevOps,"GitHub Actions (CI), Proxmox VE (Self-hosted Production)"

#⚡ Developer Guide (Getting Started)
For future reference: How to run this project locally.

# Quick Cheatsheet
## 1. Infrastructure Setup 
1. Duplicate the example env file before starting anything:
```bash
cp .env.example .env
# ⚠️ Don't forget to fill in DATABASE_URL and REDIS_HOST inside .env
```

2. In the root directory, start the database and services:
```bash
docker-compose up -d
```

## Database (Prisma)
1. Navigate to the Prisma directory (apps/api/prisma) or run from root if configured
2. the common command below for prisma
   - Generate Prisma Client
   ```bash
   npx prisma generate
   ```

   - Init Migration (Development)
   ```bash
   npx prisma migrate dev --name init
   ```

   - Migrate the update database/table
   ```bash
   npx prisma migrate dev --name  add_duration_assessment_int_default
   ```

## Backend (NestJS)
### In the apps/api folder
- install dependencies
```bash
npm install
```
- npm run start:dev (development mode)
```bash
npm run start:dev
```

## Frontend (Next.JS)
### In the apps/web folder
- Install dependencies.
```bash
npm install
```
- Development mode.
```bash
npm run dev
```

### 1. Prerequisites
Node.js >= 20.x

Docker & Docker Compose (Required for DB & Redis)

pnpm (recommended) or npm

### 2. Environment Setup
Copy the example env file:

Bash
cp .env.example .env
Update DATABASE_URL and REDIS_HOST inside .env

### 3. Start Infrastructure (DB & Redis)
Don't install Postgres manually. Use the docker-compose file:

Bash
(Starts Postgres and Redis in background)
docker-compose up -d

### 4. Database Migration
Sync the Prisma schema with the Docker database:

Bash
npx prisma migrate dev --name init

### 5. Run the Application
Run Backend (NestJS):

Bash
Watch mode (Hot Reload)
npm run start:dev

Production build test
npm run build && npm run start:prod
Run Frontend (Next.js):

Bash
cd frontend
npm run dev
  
# 🚀 Deployment

### How to deploy after commit and sync to repository origin

- After sync go to repository github where the project stored
- go to action tab
- go to Monorepo Self-Hosted Deploy under Action and All Workflow on the left
- search for button run workflow
- klik run workflow
- the deployment has been initiated

The production version is currently self-hosted on a Proxmox Home Lab utilizing LXC containers for efficiency.

CI/CD: GitHub Actions triggers build and pushes Docker image.

Exposure: Exposed securely via Cloudflare Tunnels (Zero Trust) to avoid opening public ports.
