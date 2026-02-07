import "dotenv/config";

import app from "./app";
import { prisma } from "./lib/prisma";

const port = Number(process.env.PORT || 4000);

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected database successfully");

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

main();
