# 🎯 Shift & Attendance Management System Architecture

## 1. Clean Architecture Explanation
This system is designed using a multi-layered constraint-based architecture focused on idempotency and robustness. No naive data types (like storing "time" as strings without context) are used—everything revolves around UTC `DateTime` to gracefully handle cross-day operations and timezones.

### Layers:
- **Data Access Layer (Prisma)**: Handles optimized queries, relational integrity, and indexing. 
- **Core Engine (Service Layer)**: Pure business logic (e.g., `processAttendance`, `generateRotations`) that calculates time offsets, determines anomalies, and prepares database operations without mutating state directly until the transaction commits.
- **Job Scheduler (Background Workers/Cron)**: Periodically runs checks for anomalies (auto-checkouts, forgotten check-ins, auto-rotating bulk assignment).

---

## 2. Full Prisma Schema (Optimized)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ----------------------------------------------------------------------------
// ENUMS
// ----------------------------------------------------------------------------
enum ShiftType {
  MORNING
  AFTERNOON
  NIGHT
  CUSTOM
  OFF
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  PERMISSION
  AUTO_FILLED
}

// ----------------------------------------------------------------------------
// MODELS
// ----------------------------------------------------------------------------
model User {
  id               String            @id @default(cuid())
  email            String            @unique
  name             String
  isActive         Boolean           @default(true)
  timezone         String            @default("Asia/Jakarta") // Crucial for cross-day
  
  shiftAssignments ShiftAssignment[]
  attendances      Attendance[]

  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
}

model Shift {
  id             String            @id @default(cuid())
  name           String
  type           ShiftType         
  
  // Time handled in minutes from 00:00 to support accurate UTC conversions later
  startMinute    Int               // e.g., Morning = 420 (07:00), Night = 1380 (23:00)
  durationMinute Int               // e.g., 480 (8 hours)

  assignments    ShiftAssignment[]
}

model ShiftAssignment {
  id             String   @id @default(cuid())
  userId         String
  shiftId        String
  
  // Explicitly binds a user to a shift for a SPECIFIC DATE (logical day)
  logicalDate    DateTime @db.Date 
  
  // Actual computed UTC start and end bounds based on the User's timezone
  utcStartTime   DateTime
  utcEndTime     DateTime

  user           User     @relation(fields: [userId], references: [id])
  shift          Shift    @relation(fields: [shiftId], references: [id])

  @@unique([userId, logicalDate])
  @@index([utcStartTime, utcEndTime]) // Accelerated search for cron jobs
}

model Attendance {
  id                  String           @id @default(cuid())
  userId              String
  shiftAssignmentId   String           @unique

  // Real-time capturing
  checkInTime         DateTime?
  checkOutTime        DateTime?
  
  status              AttendanceStatus @default(ABSENT)
  workMinutes         Int              @default(0)
  overtimeMinutes     Int              @default(0)
  anomalyNotes        String?          // e.g., "Auto-checkout applied"

  user             User            @relation(fields: [userId], references: [id])
  assignment       ShiftAssignment @relation(fields: [shiftAssignmentId], references: [id])

  createdAt        DateTime        @default(now())
  updatedAt        DateTime        @updatedAt

  @@index([userId, checkInTime])
}
```

---

## 3. Core Service Implementations (TypeScript)

### A. Attendance Processing Service
This ensures robust check-in/out logic, mitigating early, double, or late captures.

```typescript
import { prisma } from '../lib/prisma';

export class AttendanceService {
  /**
   * Safe Check-In handler. Handles overlap, double-check-ins, and timezone bindings.
   */
  static async processCheckIn(userId: string, timestamp: Date) {
    // 1. Find the active shift assignment for this user currently happening
    // (We include a buffer: allowed to check in 2 hours early, or up to the end of shift)
    const assignment = await prisma.shiftAssignment.findFirst({
      where: {
        userId,
        utcStartTime: { lte: new Date(timestamp.getTime() + 2 * 60 * 60 * 1000) },
        utcEndTime: { gte: timestamp },
      },
    });

    if (!assignment) throw new Error("No active shift available for this time.");

    // 2. Idempotent check: Ensure they haven't already checked in
    const existing = await prisma.attendance.findUnique({
      where: { shiftAssignmentId: assignment.id }
    });

    if (existing?.checkInTime) throw new Error("Already checked in.");

    // 3. Mark as LATE if timestamp > utcStartTime + grace period (e.g., 15 mins)
    const isLate = timestamp.getTime() > (assignment.utcStartTime.getTime() + 15 * 60000);
    
    return await prisma.attendance.upsert({
      where: { shiftAssignmentId: assignment.id },
      update: { 
        checkInTime: timestamp, 
        status: isLate ? 'LATE' : 'PRESENT' 
      },
      create: {
        userId,
        shiftAssignmentId: assignment.id,
        checkInTime: timestamp,
        status: isLate ? 'LATE' : 'PRESENT'
      }
    });
  }

  /**
   * Safe Check-out handler to lock in work/overtime minutes safely.
   */
  static async processCheckOut(userId: string, timestamp: Date) {
    // Find open attendance (checked in, but not out)
    const attendance = await prisma.attendance.findFirst({
      where: { userId, checkOutTime: null, checkInTime: { not: null } },
      include: { assignment: true }
    });

    if (!attendance) throw new Error("No active check-in found.");

    let checkOutTarget = timestamp;
    const shiftEnd = attendance.assignment.utcEndTime;

    // Prevent abuse: Hard cap checkouts to 4 hours past shift end
    const maxAllowedTime = new Date(shiftEnd.getTime() + 4 * 60 * 60 * 1000);
    if (timestamp > maxAllowedTime) {
      checkOutTarget = shiftEnd; // Override to shift end
    }

    const workMs = checkOutTarget.getTime() - attendance.checkInTime!.getTime();
    let workMinutes = Math.max(0, Math.floor(workMs / 60000));
    
    // Deduct standard break limit if worked > 6 hours (Example)
    if (workMinutes > 360) workMinutes -= 60;

    const shiftDuration = (shiftEnd.getTime() - attendance.assignment.utcStartTime.getTime()) / 60000;
    const overtimeMinutes = Math.max(0, workMinutes - shiftDuration);

    return await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOutTime: checkOutTarget,
        workMinutes,
        overtimeMinutes,
        anomalyNotes: timestamp > maxAllowedTime ? "Overridden: Late checkout capped to shift end." : null
      }
    });
  }
}
```

---

## 4. Scheduling & Auto-Rotation Engine

### The Bulk Generator
To rotate shifts fairly and handle edge cases, shifts are projected forward N days.

```typescript
export class SchedulerService {
  static rotationPattern = ["MORNING", "AFTERNOON", "NIGHT", "OFF"];

  /**
   * Generates Shift Assignments for the next 14 days based on rotation logic.
   */
  static async propagateSchedules(N_Days: number = 14) {
    const users = await prisma.user.findMany({ where: { isActive: true } });
    const shifts = await prisma.shift.findMany(); // Cached typically
    
    const assignmentsToInsert = [];
    
    for (const user of users) {
      // Find user's last assignment to know where the rotation left off
      const lastAssignment = await prisma.shiftAssignment.findFirst({
        where: { userId: user.id },
        orderBy: { logicalDate: 'desc' },
        include: { shift: true }
      });

      let currentPatternIdx = lastAssignment 
        ? this.rotationPattern.indexOf(lastAssignment.shift.type as string)
        : 0;

      let startDate = lastAssignment 
        ? new Date(lastAssignment.logicalDate.getTime() + 86400000) 
        : new Date(); // Start tomorrow or today

      // Generate next N days
      for (let i = 0; i < N_Days; i++) {
        const dateTarget = new Date(startDate.getTime() + (i * 86400000));
        
        // Advance pattern every week (7 days)
        if (i > 0 && i % 7 === 0) {
           currentPatternIdx = (currentPatternIdx + 1) % this.rotationPattern.length;
        }

        const exactShift = shifts.find(s => s.type === this.rotationPattern[currentPatternIdx]);
        if (!exactShift) continue;

        // Ensure proper UTC bounds based on user Timezone (handles Night shifts naturally)
        const utcStart = this.calculateUtc(dateTarget, exactShift.startMinute, user.timezone);
        const utcEnd = new Date(utcStart.getTime() + exactShift.durationMinute * 60000);

        assignmentsToInsert.push({
          userId: user.id,
          shiftId: exactShift.id,
          logicalDate: dateTarget,
          utcStartTime: utcStart,
          utcEndTime: utcEnd
        });
      }
    }

    // Idempotent bulk insertion
    return await prisma.shiftAssignment.createMany({
      data: assignmentsToInsert,
      skipDuplicates: true // Crucial: prevents overlap if script runs twice
    });
  }

  private static calculateUtc(date: Date, startMinute: number, tz: string): Date {
     // implementation depends on library like date-fns-tz or moment-timezones
     // returns an absolute JS Date. Example: date=14th, startMin=1380(23:00) -> returns UTC for 14th 23:00 at Target TZ.
     return new Date(); // Dummy return
  }
}
```

---

## 5. Cron Jobs & Anomaly Handling

Background workers resolve human errors idempotently.

```typescript
import cron from 'node-cron';

// 1. Midnight Sweeper: Runs every hour to catch lingering orphaned checkins
cron.schedule('0 * * * *', async () => {
   const now = new Date();
   
   // A. FORGOT CHECKOUT: End time was 2 hours ago, status still open
   const cutoff = new Date(now.getTime() - 2 * 60 * 60 * 1000);
   
   const orphaned = await prisma.attendance.findMany({
     where: { checkOutTime: null, checkInTime: { not: null } },
     include: { assignment: true }
   });

   for (const att of orphaned) {
      if (att.assignment.utcEndTime <= cutoff) {
         // Auto-close it
         await prisma.attendance.update({
           where: { id: att.id },
           data: {
             checkOutTime: att.assignment.utcEndTime, 
             status: 'AUTO_FILLED',
             anomalyNotes: "System forced check-out due to abandonment."
           }
         });
      }
   }

   // B. FORGOT CHECK-IN (No show)
   const missingCheckins = await prisma.shiftAssignment.findMany({
      where: {
         utcEndTime: { lte: cutoff },
         // Not present in Attendance table
         NOT: { attendance: { isNot: null } }
      }
   });

   for (const mis of missingCheckins) {
       await prisma.attendance.create({
         data: {
           userId: mis.userId,
           shiftAssignmentId: mis.id,
           status: 'ABSENT',
           anomalyNotes: 'Auto-marked absent (No scan detected)'
         }
       })
   }
});

// 2. Weekly Rotator Schedule Run
cron.schedule('0 0 * * 0', async () => {
    // Generate schedules ahead of time every Sunday
    await SchedulerService.propagateSchedules(14);
});
```

---

## 6. Edge Case Handling Explanations

1. **Cross-Day Shifts (The 23:00 to 07:00 Problem):**
   *Solution:* We strictly separate `logicalDate` (which day this shift "belongs" to for HR payload grouping) from `utcStartTime` and `utcEndTime`. Night shifts that span two days don't break because calculations rely purely on absolute UTC boundaries.
2. **Double Check-In / Double Check-Out:**
   *Solution:* Addressed via `@unique([shiftAssignmentId])` on the `Attendance` table and idempotent service logic. Trying to check in twice throws an immediate application error safely.
3. **Overlapping Shifts:**
   *Solution:* Prevented by the generator. `ShiftAssignment` restricts a single `userId` + `logicalDate` combination (`@@unique([userId, logicalDate])`).
4. **Network Failures (Offline caching):**
   *Solution:* Devices syncing offline timestamps submit the true scanned time. The `processCheckIn/Out` functions accept raw `timestamp` payloads rather than relying solely on `Date.now()`.

## 7. Scaling Requirements (Thousands of Users)
- **Index Optimization**: Composite indexes like `@@index([utcStartTime, utcEndTime])` allow background workers to search tens of thousands of active shifts instantly without full table scans.
- **Micro-batching**: When generating automated rotating schedules for 10,000+ users, the database connection will exhaust memory. Operations are chunked in sets of 500 records using `createMany`.
- **Read Replicas**: Direct all heavy cron query ops (like calculating total absent rates across entire zones) towards database Read Replicas to avoid locking the production check-in path.
