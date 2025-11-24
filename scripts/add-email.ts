
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Usage: npx tsx scripts/add-email.ts <email>");
    process.exit(1);
  }

  console.log(`Adding allowed email: ${email}`);

  try {
    const allowedEmail = await prisma.allowedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    console.log(`✅ Email added to allowlist: ${allowedEmail.email}`);
  } catch (error) {
    console.error("Error adding email:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
