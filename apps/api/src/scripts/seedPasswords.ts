import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

// Senha padrão para usuários de teste sem passwordHash. Ambiente fictício (ver CLAUDE.md) — não usar em produção.
const DEFAULT_PASSWORD = "mudar123";
const SALT_ROUNDS = 10;

async function seed() {
  const users = await prisma.user.findMany();

  let changed = false;
  for (const user of users) {
    if (!user.passwordHash) {
      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
      changed = true;
      console.log(`Senha padrão definida para ${user.email}`);
    }
  }

  console.log(changed ? "Usuários atualizados." : "Nenhum usuário sem senha encontrado.");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
