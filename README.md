# Information System Shift Management
_A modern shift and attendance management system built with Next.js, Shadcn/UI, and Postgresql._

---

## Overview

**Information System Shift Management** adalah aplikasi web yang dirancang untuk membantu perusahaan dalam mengatur jadwal kerja, manajemen shift, dan kehadiran karyawan secara efisien.

Sistem ini dibuat dengan **Next.js (App Router)** pada sisi frontend, masih satu stack dengan Nextjs, aplikasi ini juga menggunakan Server-action dan sedikit API-Routes pada sisi backend yang kemungkinan bug di bagian Endpoint menjadi lebih sedikit dan jauh lebih aman karena tidak bisa di tembak secara asal, Sistem ini juga sudah dilengkapi untuk menangani Cyber-attack seperti

SQL Injection
Brute force
DoS / DDoS
XXS
CSRF
Auth & Session
Authorization content / RBAC (Role Based Access)

Sistem ini juga sudah dibekali fitur testing dan prototyping dengan Jest, library testing khusus Javascript yang cepat untuk di run, cocok untuk mempercepat pembuatan fitur tanpa membuat data manual melalui form, dan kesana kemari dari browser ke code-editor

Untuk proyek berskala besar, stack dapat di-upgrade menjadi:

Next.js + TypeScript, Shadcn/UI + Tailwind CSS + Framer-motion
Zustand (state management), TanStack Query (data fetching / caching), WebSocket (real-time update), Redis (caching), Resend (Mail service)
Prisma ORM + Cloud postgresql (Neon)

---

## Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend & Backend // Fullstack** | [Next.js 14+](https://nextjs.org/) |
| **UI Components** | [Shadcn/UI](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) · [Prisma ORM](https://www.prisma.io/) · [Neon Cloud](https://neon.com/) |
| **Icons** | [Lucide](https://lucide.dev/) · [Phosphor](https://phosphoricons.com/) |

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

View : .env

```bash
cp .env.example .env
```

Edit : .env

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
