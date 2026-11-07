export interface BaseRecord {
  id: string;
  created_at: string;
  updated_at: string;
}
export type NewOf<T extends BaseRecord> = Omit<T, keyof BaseRecord>;

export interface Repo<T extends BaseRecord> {
  list(): Promise<T[]>;
  add(input: NewOf<T>): Promise<T>;
  update(id: string, patch: Partial<NewOf<T>>): Promise<T>;
  remove(id: string): Promise<void>;
}

export type TableName = "tasks" | "notes" | "planner_entries" | "habits";

export interface Task extends BaseRecord {
  title: string;
  done: boolean;
  due_date: string | null;
}
export interface Note extends BaseRecord {
  title: string;
  content: string;
}
export interface PlannerEntry extends BaseRecord {
  plan_date: string;
  start_time: string | null;
  title: string;
  done: boolean;
}
export interface Habit extends BaseRecord {
  name: string;
  completed_dates: string[];
}
