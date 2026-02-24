import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const createdAt = new Date("2026-02-20T09:00:00.000Z");

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      id: "u_admin_001",
      username: "admin",
      name: "Regional Admin",
      password: "admin123",
      role: "ADMIN",
      status: "ACTIVE",
      createdAt,
      lastLoginAt: new Date("2026-02-24T08:15:00.000Z")
    }
  });

  await prisma.user.upsert({
    where: { username: "staff" },
    update: {},
    create: {
      id: "u_staff_001",
      username: "staff",
      name: "Support Staff",
      password: "staff123",
      role: "STAFF",
      status: "ACTIVE",
      createdAt,
      lastLoginAt: new Date("2026-02-23T14:42:00.000Z")
    }
  });

  const existingLogs = await prisma.activityLog.count();
  if (existingLogs === 0) {
    await prisma.activityLog.createMany({
      data: [
        {
          id: "log_seed_001",
          user: "system",
          action: "CREATE_USER",
          target: "admin",
          timestamp: new Date("2026-02-20T09:00:00.000Z"),
          details: "Initial administrator account seeded for demo environment."
        },
        {
          id: "log_seed_002",
          user: "system",
          action: "CREATE_USER",
          target: "staff",
          timestamp: new Date("2026-02-20T09:01:00.000Z"),
          details: "Initial staff account seeded for demo environment."
        }
      ]
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

