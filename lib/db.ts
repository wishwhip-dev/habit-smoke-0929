/**
 * This application's database.
 *
 * The reusable half of the setup is in `lib/storage/` and is not edited. This file is the half
 * that describes the product: which tables exist, what is indexed, how the schema has changed over
 * time, and what a first visit starts with.
 */
import { defineDatabase } from "@/lib/storage/database";

export type Habit = {
  id: string;
  /** Trimmed, non-empty. Uniqueness is enforced by the data layer, case-insensitively. */
  name: string;
  /** Epoch millis. Indexed, because the list keeps insertion order by it. */
  createdAt: number;
};

/**
 * One tick of one habit on one local calendar date.
 *
 * The primary key is `<habitId>:<date>`, so a habit can have at most one row per day and the
 * `habitId` index covers "all ticks for this habit". `date` is `YYYY-MM-DD` in the visitor's own
 * time zone — counted by calendar date, never by dividing milliseconds, so midnight and
 * daylight-saving changes cannot skip or repeat a day.
 */
export type HabitTick = {
  id: string;
  /** Indexed, because deleting a habit removes all of its ticks by it. */
  habitId: string;
  date: string;
};

export const tickId = (habitId: string, date: string): string => `${habitId}:${date}`;

/** Ids are generated here so the data layer never depends on an auto-increment round trip. */
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export const database = defineDatabase<{ habits: Habit; ticks: HabitTick }>({
  // Part of the origin's storage identity. Renaming it does not migrate anything — it points the
  // application at a different, empty database and abandons the old one in place. That is exactly
  // what you want on a first build, and never what you want afterwards.
  name: "habit-tracker",
  versions: [
    // Only the primary key and the properties queried on: habits are ordered by `createdAt`, and
    // a habit's ticks are gathered by `habitId`. The tick's `date` is inside the primary key.
    { version: 1, stores: { habits: "id, createdAt", ticks: "id, habitId" } },
  ],
  // No seed: the product's empty state ("No habits yet") is a real state the visitor starts in,
  // not one to paper over with example rows.
});
