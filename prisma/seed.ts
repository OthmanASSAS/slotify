import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // 1. Create admin user
  console.log("Creating admin user...");
  const admin = await prisma.admin.upsert({
    where: { email: "admin@slotify.com" },
    update: {},
    create: {
      email: "admin@slotly.com",
      password: await hash("Hello1!!", 10),
    },
  });
  console.log(`✓ Admin created: ${admin.email}`);

  // 2. Create allowed emails
  console.log("Creating allowed emails...");
  const emails = [
    "etudiant1@univ.fr",
    "etudiant2@univ.fr",
    "etudiant3@univ.fr",
    "test@example.com",
  ];

  for (const email of emails) {
    await prisma.allowedEmail.upsert({
      where: { email },
      update: {},
      create: { email },
    });
  }
  console.log(`✓ ${emails.length} allowed emails created`);

  // 3. Create time slots
  console.log("Creating time slots...");
  const timeSlots = [
    // Monday (1)
    { dayOfWeek: 1, startTime: "09:00", endTime: "13:00", maxCapacity: 25 },
    { dayOfWeek: 1, startTime: "14:00", endTime: "18:00", maxCapacity: 25 },
    // Tuesday (2)
    { dayOfWeek: 2, startTime: "09:00", endTime: "12:00", maxCapacity: 25 },
    { dayOfWeek: 2, startTime: "14:00", endTime: "17:00", maxCapacity: 25 },
    // Wednesday (3)
    { dayOfWeek: 3, startTime: "10:00", endTime: "13:00", maxCapacity: 25 },
    { dayOfWeek: 3, startTime: "14:00", endTime: "18:00", maxCapacity: 25 },
    // Thursday (4)
    { dayOfWeek: 4, startTime: "09:00", endTime: "13:00", maxCapacity: 25 },
    { dayOfWeek: 4, startTime: "14:00", endTime: "17:00", maxCapacity: 25 },
    // Friday (5)
    { dayOfWeek: 5, startTime: "09:00", endTime: "12:00", maxCapacity: 25 },
    { dayOfWeek: 5, startTime: "14:00", endTime: "16:00", maxCapacity: 25 },
  ];

  for (const slot of timeSlots) {
    await prisma.timeSlot.upsert({
      where: {
        dayOfWeek_startTime_endTime: {
          dayOfWeek: slot.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
        },
      },
      update: {},
      create: slot,
    });
  }
  console.log(`✓ ${timeSlots.length} time slots created`);

  console.log("✅ Seed completed!");
  console.log("\n📝 Admin credentials:");
  console.log("   Email: admin@slotly.com");
  console.log("   Password: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error during seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
