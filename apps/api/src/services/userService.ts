import { createCrudRepository } from "../lib/crudRepository";
import { prisma } from "../lib/prisma";
import { PublicUser, User } from "../types/domain";

const repository = createCrudRepository<User>(prisma.user, "user");

export const userService = {
  ...repository,
  async findByEmail(email: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ?? undefined;
  },
};

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
