import { createCrudRepository } from "../lib/crudRepository";
import { PublicUser, User } from "../types/domain";

const repository = createCrudRepository<User>("users.json", "user");

export const userService = {
  ...repository,
  async findByEmail(email: string): Promise<User | undefined> {
    const users = await repository.list();
    return users.find((user) => user.email === email);
  },
};

export function toPublicUser(user: User): PublicUser {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}
