import bcrypt from "bcryptjs";
import { readData, writeData } from "../lib/jsonStore";
import { User } from "../types/domain";

// Senha padrão para usuários de teste sem passwordHash. Ambiente fictício (ver CLAUDE.md) — não usar em produção.
const DEFAULT_PASSWORD = "mudar123";
const SALT_ROUNDS = 10;

async function seed() {
  const users = await readData<User[]>("users.json");

  let changed = false;
  for (const user of users) {
    if (!user.passwordHash) {
      user.passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, SALT_ROUNDS);
      changed = true;
      console.log(`Senha padrão definida para ${user.email}`);
    }
  }

  if (changed) {
    await writeData("users.json", users);
    console.log("users.json atualizado.");
  } else {
    console.log("Nenhum usuário sem senha encontrado.");
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
