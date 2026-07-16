import { randomUUID } from "crypto";
import { readData, writeData } from "./jsonStore";

export interface WithId {
  id: string;
}

/** Fábrica de CRUD genérico para arquivos JSON que guardam um array de entidades com `id`. */
export function createCrudRepository<T extends WithId>(fileName: string, idPrefix: string) {
  return {
    async list(): Promise<T[]> {
      return readData<T[]>(fileName);
    },

    async findById(id: string): Promise<T | undefined> {
      const items = await readData<T[]>(fileName);
      return items.find((item) => item.id === id);
    },

    async create(input: Omit<T, "id">): Promise<T> {
      const items = await readData<T[]>(fileName);
      const created = { ...input, id: `${idPrefix}_${randomUUID()}` } as T;
      items.push(created);
      await writeData(fileName, items);
      return created;
    },

    async update(id: string, patch: Partial<Omit<T, "id">>): Promise<T | undefined> {
      const items = await readData<T[]>(fileName);
      const index = items.findIndex((item) => item.id === id);
      if (index === -1) return undefined;

      const updated = { ...items[index], ...patch, id } as T;
      items[index] = updated;
      await writeData(fileName, items);
      return updated;
    },

    async remove(id: string): Promise<boolean> {
      const items = await readData<T[]>(fileName);
      const filtered = items.filter((item) => item.id !== id);
      if (filtered.length === items.length) return false;

      await writeData(fileName, filtered);
      return true;
    },
  };
}
