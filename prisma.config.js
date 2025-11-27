import { defineConfig } from "@prisma/config";

export default defineConfig({
  migrate: {
    connectionString: process.env.DATABASE_URL,
  },
});
