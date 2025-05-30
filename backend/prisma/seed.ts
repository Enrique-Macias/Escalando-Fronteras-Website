import dotenv from 'dotenv';
dotenv.config(); 
import { PrismaClient, Role } from "../src/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();



async function main() {
  const password = 'admin1234'
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: 'admin1@escalando.org' },
    update: {},
    create: {
        email: 'admin1@escalando.org',
        passwordHash,
        fullName: 'Admin',
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