/**
 * This app's data-access functions. Components call these, never Dexie directly.
 */
import { database, newId, tickId, type Habit, type HabitTick } from "@/lib/db";

const habits = async () => (await database.ready()).habits;
const ticks = async () => (await database.ready()).ticks;

/** All habits, oldest first — the order they were added in. */
export async function listHabits(): Promise<Habit[]> {
  return (await habits()).orderBy("createdAt").toArray();
}

/** Every tick in the database. The table only holds recent days, so reading it whole is cheap. */
export async function listTicks(): Promise<HabitTick[]> {
  return (await ticks()).toArray();
}

export type AddHabitResult = { ok: true; habit: Habit } | { ok: false; error: string };

/**
 * Add a habit. Rejects an empty name and a name that already exists, case-insensitively.
 *
 * The duplicate check and the insert share one transaction, so two tabs adding the same name at
 * the same moment cannot both slip past the check.
 */
export async function addHabit(rawName: string): Promise<AddHabitResult> {
  const name = rawName.trim();
  if (!name) return { ok: false, error: "Give the habit a name." };

  const db = await database.ready();
  return db.transaction("rw", db.habits, async (): Promise<AddHabitResult> => {
    const existing = await db.habits.toArray();
    const duplicate = existing.find((habit) => habit.name.toLowerCase() === name.toLowerCase());
    if (duplicate) {
      return { ok: false, error: `A habit named \u201C${duplicate.name}\u201D already exists.` };
    }

    const habit: Habit = { id: newId(), name, createdAt: Date.now() };
    await db.habits.add(habit);
    return { ok: true, habit };
  });
}

/** Delete a habit and every tick of it, in one transaction. Other habits are untouched. */
export async function deleteHabit(habitId: string): Promise<void> {
  const db = await database.ready();
  await db.transaction("rw", db.habits, db.ticks, async () => {
    await db.ticks.where("habitId").equals(habitId).delete();
    await db.habits.delete(habitId);
  });
}

/**
 * Tick a habit for a calendar date, or un-tick it if it is already ticked.
 *
 * The write is keyed by `<habitId>:<date>`, so a habit can only ever have one row per day.
 */
export async function toggleTick(habitId: string, date: string): Promise<void> {
  const table = await ticks();
  const id = tickId(habitId, date);
  const existing = await table.get(id);
  if (existing) await table.delete(id);
  else await table.put({ id, habitId, date });
}
