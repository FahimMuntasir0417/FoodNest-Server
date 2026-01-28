import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";
import "dotenv/config";

async function seedAdmin() {
  try {
    const name = process.env.SEED_ADMIN_NAME || "Admin";
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const roleStr = process.env.SEED_ADMIN_ROLE || "ADMIN";
    const baseUrl = process.env.SEED_API_BASE_URL || "http://localhost:4000";

    if (!email || !password) {
      throw new Error(
        "Missing env. Please set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env",
      );
    }

    const role =
      roleStr === "ADMIN"
        ? UserRole.ADMIN
        : roleStr === "USER"
          ? UserRole.CUSTOMER
          : UserRole.ADMIN;

    const adminData = { name, email, role, password };

    console.log("***** Upsert/Check Admin");

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      // ensure admin role + verified
      await prisma.user.update({
        where: { email },
        data: {
          role: UserRole.ADMIN,
          emailVerified: true,
        },
      });
      console.log(
        " Admin already exists. Ensured role=ADMIN and emailVerified=true",
      );
      return;
    }

    // console.log("***** Creating Admin via API Signup");
    const origin = process.env.SEED_API_ORIGIN || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/auth/sign-up/email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: origin,
        Referer: `${origin}/`,
      },
      body: JSON.stringify(adminData),
    });

    const text = await res.text();
    if (!res.ok) {
      throw new Error(` Signup failed: ${res.status} ${text}`);
    }

    // console.log("**** Admin created");

    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdmin();
