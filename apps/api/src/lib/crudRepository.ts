import { randomUUID } from "crypto";
import { Prisma } from "@prisma/client";

function isNotFoundError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

export interface WithId {
  id: string;
}

interface PrismaDelegate<T> {
  findMany(): Promise<T[]>;
  findUnique(args: { where: { id: string } }): Promise<T | null>;
  create(args: { data: T }): Promise<T>;
  update(args: { where: { id: string }; data: Partial<T> }): Promise<T>;
  delete(args: { where: { id: string } }): Promise<T>;
}

/** Fábrica de CRUD genérico sobre um delegate do Prisma Client para uma entidade com `id`. */
export function createCrudRepository<T extends WithId>(delegate: PrismaDelegate<T>, idPrefix: string) {
  return {
    async list(): Promise<T[]> {
      return delegate.findMany();
    },

    async findById(id: string): Promise<T | undefined> {
      const item = await delegate.findUnique({ where: { id } });
      return item ?? undefined;
    },

    async create(input: Omit<T, "id">): Promise<T> {
      const data = { ...input, id: `${idPrefix}_${randomUUID()}` } as T;
      return delegate.create({ data });
    },

    async update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | undefined> {
      try {
        return await delegate.update({ where: { id }, data: patch as Partial<T> });
      } catch (error) {
        if (isNotFoundError(error)) return undefined;
        throw error;
      }
    },

    async remove(id: string): Promise<boolean> {
      try {
        await delegate.delete({ where: { id } });
        return true;
      } catch (error) {
        if (isNotFoundError(error)) return false;
        throw error;
      }
    },
  };
}
