import { defineConfig } from "@prisma/config";
import dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  migrate: {
    connectionString: process.env.DATABASE_URL,
  },
});
