"use client";

import { useRef } from "react";
import { Download, Upload } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { database } from "@/lib/db";
import { listHabits, listTicks } from "@/lib/data/habits";
import { useDatabaseTransfer, useStorageStatus, useStoredQuery } from "@/lib/storage/react";
import { AddHabitForm } from "./add-habit-form";
import { HabitCard } from "./habit-card";

/**
 * The whole habit tracker, as one client island inside the server-rendered page.
 *
 * The two live queries (habits, ticks) re-run on their own after every write, so a tick or a
 * delete shows up without a refetch. The server render is the skeleton: the database only opens
 * in the browser, so nothing data-shaped is drawn until `useStoredQuery` has a result.
 */
export function HabitTracker() {
  const habitsQuery = useStoredQuery(database, listHabits);
  const ticksQuery = useStoredQuery(database, listTicks);
  const status = useStorageStatus(database);
  const { state, exportToFile, importFromFile } = useDatabaseTransfer(database);
  const fileInput = useRef<HTMLInputElement>(null);

  const habits = habitsQuery.data;
  const ticks = ticksQuery.data;
  const ticksByHabit = new Map<string, typeof ticks>();
  for (const tick of ticks ?? []) {
    const list = ticksByHabit.get(tick.habitId) ?? [];
    list.push(tick);
    ticksByHabit.set(tick.habitId, list);
  }

  const loading = habitsQuery.isLoading || ticksQuery.isLoading;

  return (
    <div className="flex flex-col gap-4">
      <AddHabitForm />

      {status === "memory" ? (
        <Alert>
          <AlertTitle>This browser will not keep your data</AlertTitle>
          <AlertDescription>
            Storage was refused here, so everything works but nothing survives a reload. Use
            Export below to carry your habits to a file.
          </AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : habits && habits.length > 0 ? (
        <ul className="flex list-none flex-col gap-3 p-0">
          {habits.map((habit) => (
            <li key={habit.id}>
              <HabitCard habit={habit} ticks={ticksByHabit.get(habit.id) ?? []} />
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-1 py-10 text-center">
            <p className="text-lg font-semibold">No habits yet</p>
            <p className="text-sm text-muted-foreground">
              Add your first habit above — for example &ldquo;Drink water&rdquo; — and tick it off
              each day.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-2 border-t pt-4">
        <Button variant="outline" size="sm" onClick={() => void exportToFile()}>
          <Download aria-hidden="true" className="mr-2 h-4 w-4" /> Export data
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInput.current?.click()}
        >
          <Upload aria-hidden="true" className="mr-2 h-4 w-4" /> Import data
        </Button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="sr-only"
          aria-label="Import data from a JSON file"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importFromFile(file, "merge");
            event.target.value = "";
          }}
        />
        {state.kind === "error" ? (
          <p role="alert" className="w-full text-sm font-medium text-destructive">
            {state.message}
          </p>
        ) : null}
        {state.kind === "imported" ? (
          <p role="status" className="w-full text-sm text-muted-foreground">
            Import finished: {state.result.rows}{" "}
            {state.result.rows === 1 ? "row" : "rows"} restored.
          </p>
        ) : null}
      </div>
    </div>
  );
}