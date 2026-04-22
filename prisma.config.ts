import { defineConfig } from "prisma/config";

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_10kupJSgdrDt@ep-mute-sea-aofr7lgb-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: DATABASE_URL,
  },
});
