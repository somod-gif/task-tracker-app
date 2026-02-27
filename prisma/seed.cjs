/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");

const bcrypt = require("bcrypt");
const { PrismaPg } = require("@prisma/adapter-pg");
const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function upsertUser({ name, email, password, role, companyId, departmentId }) {
  const passwordHash = await bcrypt.hash(password, 10);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      companyId: companyId ?? null,
      departmentId: departmentId ?? null,
      passwordHash,
      mustChangePassword: false,
      passwordUpdatedAt: null,
    },
    create: {
      name,
      email,
      role,
      companyId: companyId ?? null,
      departmentId: departmentId ?? null,
      passwordHash,
      mustChangePassword: false,
      passwordUpdatedAt: null,
    },
  });
}

async function main() {
  const platformOwnerEmail = (process.env.BOOTSTRAP_PLATFORM_OWNER_EMAIL || "platform@sprintdesk.local").toLowerCase();
  const platformOwnerPassword = process.env.BOOTSTRAP_PLATFORM_OWNER_PASSWORD || "password";

  await upsertUser({
    name: "Sprint Desk Platform Owner",
    email: platformOwnerEmail,
    password: platformOwnerPassword,
    role: "PLATFORM_OWNER",
    companyId: null,
    departmentId: null,
  });

  console.log("Seed completed with initial platform owner account.");
  console.log(`Email: ${platformOwnerEmail}`);
  console.log(`Password: ${platformOwnerPassword}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
