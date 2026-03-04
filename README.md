# Information System Shift Management
_A modern shift and attendance management system built with Next.js, Shadcn/UI, and Postgresql._

---

# Overview

**Information System Shift Management** adalah aplikasi web yang dirancang untuk membantu perusahaan dalam mengatur jadwal kerja, manajemen shift, dan kehadiran karyawan secara efisien.

Sistem SaaS ini dibuat dengan **Next.js (App Router)** pada sisi frontend, masih satu stack dengan Nextjs, aplikasi ini juga menggunakan Server-action dan sedikit API-Routes pada sisi backend yang kemungkinan bug di bagian Endpoint menjadi lebih sedikit dan jauh lebih aman karena tidak bisa di tembak secara asal, Sistem ini juga sudah dilengkapi untuk menangani Cyber-attack seperti

# Web Security Topics

Daftar topik terkait keamanan aplikasi web yang penting untuk dipahami:

### 1. SQL Injection
Teknik menyerang aplikasi dengan memasukkan kode SQL berbahaya ke input form atau parameter URL untuk mengakses atau memodifikasi database tanpa izin.

### 2. Brute Force
Serangan mencoba banyak kombinasi username dan password secara otomatis untuk mendapatkan akses ke akun pengguna.

### 3. DoS / DDoS
- **DoS (Denial of Service):** Serangan yang membuat server atau aplikasi tidak bisa melayani request normal.
- **DDoS (Distributed DoS):** Serangan DoS yang dilakukan dari banyak sumber (botnet) secara bersamaan.

### 4. XSS (Cross-Site Scripting)
Serangan yang menyuntikkan script berbahaya (JavaScript) ke halaman web sehingga dapat mencuri data pengguna atau mengubah tampilan.

### 5. CSRF (Cross-Site Request Forgery)
Serangan yang memaksa user yang sudah login untuk melakukan aksi yang tidak diinginkan pada aplikasi web.

### 6. Auth & Session
- Mengamankan proses autentikasi user.
- Mengelola sesi (session) dengan aman menggunakan cookie, token JWT, atau mekanisme lain.

### 7. Authorization / RBAC (Role-Based Access Control)
Membatasi akses konten atau fitur aplikasi berdasarkan **role** pengguna.
Contoh: Admin hanya bisa ke `/admin/dashboard`, Employee hanya ke `/employee/dashboard`.

Sistem ini juga sudah dibekali fitur testing dan prototyping dengan Jest, library testing khusus Javascript yang cepat untuk di run, cocok untuk mempercepat pembuatan fitur tanpa membuat data manual melalui form, dan kesana kemari dari browser ke code-editor,
Sistem ini juga bagus dari segi performa, baik animasi-transisi antar page, atau pun pengambilan dan rendering data berat.

Untuk proyek berskala besar, stack dapat di-upgrade dengan menggunakan stack stack berikut:

Next.js + TypeScript, Shadcn/UI + Tailwind CSS + Framer-motion
Zustand (state management), TanStack Query (data fetching / caching), Pusher (real-time update), Redis (caching), Resend (Mail service)
Prisma ORM + Cloud postgresql (Neon)

---

# Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend & Backend // Fullstack** | [Next.js 14+](https://nextjs.org/) |
| **UI Components** | [Shadcn/UI](https://ui.shadcn.com/) · [Tailwind CSS](https://tailwindcss.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) · [Prisma ORM](https://www.prisma.io/) · [Neon Cloud](https://neon.com/) |
| **Icons** | [Lucide](https://lucide.dev/) · [Phosphor](https://phosphoricons.com/) |
| **Library** | **Backend:** [@prisma/client](https://www.npmjs.com/package/@prisma/client) · [bcryptjs](https://www.npmjs.com/package/bcryptjs) · [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) <br> **Frontend:** [react](https://reactjs.org/) · [framer-motion](https://www.framer.com/motion/) · [zustand](https://zustand-demo.pmnd.rs/) |

# Features

✅ **Helpers Feature**
Search, Filter, Sort, Selecting, Select All, Delete Selected, Delete All, Export, Data-entries & Pagination.
Create, Read, Update, Delete, Views detail.

✅ **Role-based Access Control**
Admin, Coordinator(Next plan), Employee, User

---

## 1. Clone Repository

```bash
git clone https://github.com/setsuwww/ISSM-Virspeed.git
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
Laragon, XAMPP, MAMP / MAMP Pro, WampServer, AMPPS, Docker, Vagrant, Local by Flywheel, Devilbox, Laravel herd, and Whatever is that -_-


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

Open Virspeed/prisma/seed.js to see the accounts listed when running **npm run prisma:seed**
Open Virspeed/prisma/seedAttendance.js to see the attendance-demo when running **npm run prisma:att-seed**

Open localhost://port and try to login

# Thankyou
## Love your work
### Happy coding, make it chill...
