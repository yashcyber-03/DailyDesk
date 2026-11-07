import type { SupabaseClient } from "@supabase/supabase-js";
import { UserError } from "../errors.ts";
import type { BaseRecord, NewOf, Repo, TableName } from "./types.ts";

export const REMOTE_LIST_LIMIT = 2000;

export function mapDbError(error: { code?: string } | null | undefined): UserError {
  // 23514 = check violation (text too long, or per-user item limit reached)
  if (error?.code === "23514") return new UserError("That is too long, or you have reached the limit of saved items.");
  if (error?.code === "42501" || error?.code === "PGRST301") return new UserError("Please log in again to save your changes.");
  return new UserError("Could not save your changes. Please try again.");
}

/** Account storage in Supabase. Row Level Security limits every query to the signed-in user. */
// The client is untyped (no generated database types), so row payloads are cast. Row Level Security and
// database constraints are what actually protect the data.
export function createRemoteRepo<T extends BaseRecord>(client: SupabaseClient, table: TableName): Repo<T> {
  return {
    async list() {
      const { data, error } = await client.from(table).select("*").order("created_at", { ascending: false }).limit(REMOTE_LIST_LIMIT);
      if (error) throw mapDbError(error);
      return (data ?? []) as unknown as T[];
    },
    async add(input: NewOf<T>) {
      const { data, error } = await client.from(table).insert(input as never).select().single();
      if (error) throw mapDbError(error);
      return data as unknown as T;
    },
    async update(id, patch) {
      const { data, error } = await client.from(table).update(patch as never).eq("id", id).select().single();
      if (error) throw mapDbError(error);
      return data as unknown as T;
    },
    async remove(id) {
      const { error } = await client.from(table).delete().eq("id", id);
      if (error) throw mapDbError(error);
    },
  };
}
