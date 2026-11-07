"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { UserError } from "@/lib/errors";
import { createLocalRepo } from "@/lib/repo/local";
import type { BaseRecord, NewOf, Repo, TableName } from "@/lib/repo/types";

const messageOf = (e: unknown) => (e instanceof UserError ? e.message : "Something went wrong. Please try again.");
/**
 * Saved productivity data stays in this browser and is never synced to an account.
 */
export function useCollection<T extends BaseRecord>(table: TableName) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const repo = useMemo<Repo<T>>(() => createLocalRepo<T>(table), [table]);

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

  const add = useCallback(
    async (input: NewOf<T>): Promise<T | null> => {
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

  return {
    items,
    loading,
    error,
    add,
    update,
    remove,
  };
}
