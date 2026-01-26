# Information System Shift Management
_A modern shift and attendance management system built with Next.js, Shadcn/UI, and MySQL._

---

## Overview

**Information System Shift Management** adalah aplikasi web yang dirancang untuk membantu perusahaan dalam mengatur jadwal kerja, manajemen shift, dan kehadiran karyawan secara efisien.

Sistem ini dibuat dengan **Next.js (App Router)** di sisi frontend/backend, menggunakan **Shadcn/UI** untuk komponen antarmuka yang elegan, dan **MySQL** sebagai basis data utama.

Untuk proyek berskala besar, stack dapat di-upgrade menjadi:

Next.js + TypeScript, Shadcn/UI + Tailwind CSS
Zustand (state management), TanStack Query (data fetching / caching), WebSocket (real-time update)
Prisma ORM + PostgreSQL, Golang (optional microservices / backend service)

---

## Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend & Backend // Fullstack** | [Next.js 14+](https://nextjs.org/) |
| **UI Components** | [Shadcn/UI](https://ui.shadcn.com/) [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [MySQL](https://www.mysql.com/) [Prisma ORM](https://www.prisma.io/) |
| **Icons** | [Lucide](https://lucide.dev/) | [Phosphor](//https://phosphoricons.com/) |

---

## Features

✅ **Helpers Feature**  
Search, Filter, Sort, Selecting, Select All, Delete Selected, Delete All, Export, Pagination.
Create, Read, Update, Delete, Views detail.

✅ **Role-based Access Control**  
Admin, Coordinator(Next plan), Employee, User

---

### 1. Clone Repository

```bash
git clone https://github.com/setsuwww/b-fast.git
cd b-fast
```

## 2. Installation

Using npm, pnpm, yarn, or bun for node package manager

```bash
npm install
# or
pnpm install
# or
yarn install
# or 
bun install
```

---

### 3. Setup Environtment

DATABASE_URL="mysql://username:password@localhost:3306/your_db_name"
JWT_SECRET="your-secret-key"

---

## 4. Run Application

Turn on your local webserver
Laragon, XAMPP, MAMP / MAMP Pro, WampServer, AMPPS, Docker, Vagrant, Local by Flywheel, Devilbox
and whatever


```bash
npx prisma migrate dev
# or
pnpx prisma migrate dev
# or
bunx prisma migrate dev
```

```bash
npx prisma generate
# or
pnpx prisma generate
# or
bunx prisma generate
```

```bash
npm run prisma:seed 
# or
pnpm run prisma:seed
# or
bunx run prisma:seed
```

```bash
npm run dev
# or
pnpm run dev
# or
yarn run dev
# or 
bun run dev
```

---

Open app-server port at

Open B-fast/prisma/seed.js to see the accounts listed when running **npm run prisma:seed**

# Thankyou
