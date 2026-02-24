import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient({
    log: ["query"],
  });
} else {
  if (!globalThis.prisma) {
    globalThis.prisma = new PrismaClient({
      log: ["query"],
    });
  }
  prisma = globalThis.prisma;
}

export { prisma };
