import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const seedUser = {
  name: "TourVibe Super Admin",
  email: "admin@tourvibe.demo",
  password: "SuperAdmin123!",
};

let seedPromise: Promise<void> | null = null;

async function createSeedUser() {
  const existingUser = await db.user.findUnique({
    where: { email: seedUser.email },
    select: { id: true },
  });

  if (existingUser) {
    await db.user.update({
      where: { id: existingUser.id },
      data: { role: "super_admin" },
    });
    return;
  }

  await auth.api.signUpEmail({
    body: seedUser,
  });

  await db.user.update({
    where: { email: seedUser.email },
    data: { role: "super_admin" },
  });
}

export async function ensureSeededSuperAdmin() {
  if (!seedPromise) {
    seedPromise = createSeedUser().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }

  await seedPromise;
}

export const seededAdminCredentials = seedUser;
