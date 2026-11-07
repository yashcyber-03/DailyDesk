"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { UserError } from "@/lib/errors";
import { createLocalRepo } from "@/lib/repo/local";
import { createRemoteRepo } from "@/lib/repo/remote";
import type { BaseRecord, NewOf, Repo, TableName } from "@/lib/repo/types";
import { createClient } from "@/lib/supabase/client";

const messageOf = (e: unknown) => (e instanceof UserError ? e.message : "Something went wrong. Please try again.");
const IMPORT_MAX = 200;

/**
 * One list of records. Guests: stored in this browser. Signed-in users: stored in their Supabase account.
 * Nothing is moved from the browser to the account unless the user asks (importLocal).
 */
export function useCollection<T extends BaseRecord>(table: TableName) {
  const { user, loading: authLoading, configured } = useAuth();
  const userId = user?.id ?? null;
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localCount, setLocalCount] = useState(0);

  const repo = useMemo<Repo<T> | null>(() => {
    if (authLoading) return null;
    return userId ? createRemoteRepo<T>(createClient(), table) : createLocalRepo<T>(table);
  }, [authLoading, userId, table]);

  useEffect(() => {
    if (!repo) return;
    let cancelled = false;
    setLoading(true);
    repo
      .list()
      .then((list) => {
        if (!cancelled) {
          setItems(list);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(messageOf(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [repo]);

  useEffect(() => {
    setLocalCount(userId ? createLocalRepo<T>(table).count() : 0);
  }, [userId, table]);

  const add = useCallback(
    async (input: NewOf<T>): Promise<T | null> => {
      if (!repo) return null;
      setError(null);
      try {
        const item = await repo.add(input);
        setItems((prev) => [item, ...prev]);
        return item;
      } catch (e) {
        setError(messageOf(e));
        return null;
      }
    },
    [repo],
  );

  const update = useCallback(
    async (id: string, patch: Partial<NewOf<T>>): Promise<T | null> => {
      if (!repo) return null;
      setError(null);
      try {
        const item = await repo.update(id, patch);
        setItems((prev) => prev.map((i) => (i.id === id ? item : i)));
        return item;
      } catch (e) {
        setError(messageOf(e));
        return null;
      }
    },
    [repo],
  );

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      if (!repo) return false;
      setError(null);
      try {
        await repo.remove(id);
        setItems((prev) => prev.filter((i) => i.id !== id));
        return true;
      } catch (e) {
        setError(messageOf(e));
        return false;
      }
    },
    [repo],
  );

  const importLocal = useCallback(async () => {
    if (!repo || !userId) return;
    setError(null);
    try {
      const local = createLocalRepo<T>(table);
      const oldestFirst = (await local.list()).reverse().slice(0, IMPORT_MAX);
      for (const item of oldestFirst) {
        const { id: _id, created_at: _c, updated_at: _u, ...rest } = item;
        void _id; void _c; void _u;
        await repo.add(rest as unknown as NewOf<T>);
      }
      local.clear();
      setLocalCount(0);
      setItems(await repo.list());
    } catch (e) {
      setError(messageOf(e));
    }
  }, [repo, userId, table]);

  return {
    items,
    loading: loading || authLoading,
    error,
    mode: userId ? ("account" as const) : ("guest" as const),
    configured,
    localCount,
    add,
    update,
    remove,
    importLocal,
  };
}
