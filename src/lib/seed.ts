import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

const seedUser = {
  name: "TourVibe Super Admin",
  email: "admin@tourvibe.demo",
  password: "SuperAdmin123!",
};

let seedPromise: Promise<void> | null = null;

async function createSeedUser() {
  const existingUser = db
    .prepare("SELECT id FROM user WHERE email = ?")
    .get(seedUser.email) as { id: string } | undefined;

  if (existingUser) {
    db.prepare("UPDATE user SET role = ? WHERE id = ?").run(
      "super_admin",
      existingUser.id,
    );
    return;
  }

  await auth.api.signUpEmail({
    body: seedUser,
  });

  db.prepare("UPDATE user SET role = ? WHERE email = ?").run(
    "super_admin",
    seedUser.email,
  );
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
