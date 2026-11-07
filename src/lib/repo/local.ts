import { UserError } from "../errors.ts";
import type { BaseRecord, NewOf, Repo } from "./types.ts";

export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const LOCAL_MAX_ITEMS = 1000;
export const localKey = (table: string) => `dailydesk:local:${table}`;

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface LocalRepo<T extends BaseRecord> extends Repo<T> {
  clear(): void;
  count(): number;
}

/** Guest storage in the browser. Data never leaves the device. */
export function createLocalRepo<T extends BaseRecord>(
  table: string,
  getStore: () => KeyValueStore = () => window.localStorage,
  now: () => Date = () => new Date(),
): LocalRepo<T> {
  const key = localKey(table);

  function read(): T[] {
    try {
      const raw = getStore().getItem(key);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (x): x is T => typeof x === "object" && x !== null && typeof (x as { id?: unknown }).id === "string",
      );
    } catch {
      return [];
    }
  }

  function write(items: T[]) {
    try {
      getStore().setItem(key, JSON.stringify(items));
    } catch {
      throw new UserError("Your browser could not save this. Storage may be full or blocked.");
    }
  }

  const sorted = (items: T[]) => [...items].sort((a, b) => (a.created_at < b.created_at ? 1 : a.created_at > b.created_at ? -1 : 0));

  return {
    async list() {
      return sorted(read());
    },
    async add(input: NewOf<T>) {
      const items = read();
      if (items.length >= LOCAL_MAX_ITEMS) throw new UserError("You have reached the limit of saved items. Delete some first.");
      const stamp = now().toISOString();
      const item = { ...input, id: newId(), created_at: stamp, updated_at: stamp } as unknown as T;
      write([item, ...items]);
      return item;
    },
    async update(id, patch) {
      const items = read();
      const index = items.findIndex((i) => i.id === id);
      if (index === -1) throw new UserError("That item no longer exists.");
      const updated = { ...items[index], ...patch, updated_at: now().toISOString() } as T;
      items[index] = updated;
      write(items);
      return updated;
    },
    async remove(id) {
      write(read().filter((i) => i.id !== id));
    },
    clear() {
      try {
        getStore().removeItem(key);
      } catch {
        // ignore
      }
    },
    count() {
      return read().length;
    },
  };
}
