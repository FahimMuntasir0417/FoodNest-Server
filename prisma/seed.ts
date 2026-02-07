// prisma/seed.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

import { randomUUID } from "node:crypto";
import { PrismaClient } from "./../generated/prisma/index.d";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const providerUserEmail = "provider1@foodhub.com";

  const user = await prisma.user.upsert({
    where: { email: providerUserEmail },
    update: {
      name: "Provider One",
      role: "PROVIDER",
    },
    create: {
      id: randomUUID(),
      email: providerUserEmail,
      name: "Provider One",
      role: "PROVIDER",
    },
  });

  const providerProfile = await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: {
      shopName: "Provider One Kitchen",
    },
    create: {
      userId: user.id,
      shopName: "Provider One Kitchen",
    },
  });

  await prisma.meal.deleteMany({
    where: {
      providerId: providerProfile.id,
      title: "Chicken Biryani",
    },
  });

  await prisma.meal.create({
    data: {
      providerId: providerProfile.id,
      categoryId: null,
      title: "Chicken Biryani",
      description: "Classic biryani",
      price: 350,
      cuisine: "Bangladeshi",
      isAvailable: true,
    },
  });
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
