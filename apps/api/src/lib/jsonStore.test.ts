import { promises as fs } from "fs";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { readData, writeData } from "./jsonStore";

const TEST_FILE = "__test__.jsonStore.json";
const TEST_FILE_PATH = path.join(__dirname, "..", "data", TEST_FILE);

afterEach(async () => {
  await fs.rm(TEST_FILE_PATH, { force: true });
});

describe("jsonStore", () => {
  it("writes and reads back the same data", async () => {
    const payload = { hello: "world", count: 2 };

    await writeData(TEST_FILE, payload);
    const result = await readData<typeof payload>(TEST_FILE);

    expect(result).toEqual(payload);
  });

  it("overwrites existing data on subsequent writes", async () => {
    await writeData(TEST_FILE, { value: 1 });
    await writeData(TEST_FILE, { value: 2 });

    const result = await readData<{ value: number }>(TEST_FILE);

    expect(result.value).toBe(2);
  });
});
