import { PrismaClient, Role } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = 'admin123'
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin@escalando.org' },
    update: {},
    create: {
        email: 'admin@escalando.org',
        passwordHash,
        role: Role.ADMIN,
    },
  });

  console.log(`Usuario creado:`, user);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
})
.finally(async () => {
    await prisma.$disconnect();
});