import app from "./app";
import { prisma } from "./lib/prisma";

const port = process.env.PORT;

async function main() {
  try {
    await prisma.$connect();
    console.log("Connected database successfully");

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("An error occurred:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}
main();
