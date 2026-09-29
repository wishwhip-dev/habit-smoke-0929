"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { deleteHabit, toggleTick } from "@/lib/data/habits";
import { lastNDayKeys, todayKey } from "@/lib/dates";
import { WeekChart } from "./week-chart";
import type { Habit, HabitTick } from "@/lib/db";

/**
 * One habit: its name, a tick control for today, the 7-day chart, and a Delete control that asks
 * for confirmation before removing anything.
 */
export function HabitCard({ habit, ticks }: { habit: Habit; ticks: HabitTick[] }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dates = lastNDayKeys(7);
  const today = todayKey();
  const ticked = new Set(ticks.map((tick) => tick.date));
  const doneToday = ticked.has(today);
  const doneThisWeek = dates.filter((date) => ticked.has(date)).length;

  async function handleToggle() {
    // No optimistic change: the live query re-runs the moment the write lands.
    try {
      await toggleTick(habit.id, today);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the tick. Try again.");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteHabit(habit.id);
      setConfirming(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete the habit. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex min-w-0 items-center gap-3">
          <Checkbox
            id={`done-${habit.id}`}
            checked={doneToday}
            onCheckedChange={handleToggle}
            aria-label={`Mark ${habit.name} as done for today`}
            className="h-6 w-6"
          />
          <div className="min-w-0">
            <Label
              htmlFor={`done-${habit.id}`}
              className="block cursor-pointer truncate text-base font-semibold"
            >
              {habit.name}
            </Label>
            <p className="text-xs text-muted-foreground">
              {doneThisWeek} of the last 7 days
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-destructive hover:text-destructive"
          onClick={() => setConfirming(true)}
        >
          Delete
        </Button>
      </CardHeader>
      <CardContent>
        <WeekChart dates={dates} ticked={ticked} today={today} />
        {error ? (
          <p role="alert" className="mt-2 text-sm font-medium text-destructive">
            {error}
          </p>
        ) : null}
      </CardContent>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete habit?</DialogTitle>
            <DialogDescription>
              This removes &ldquo;{habit.name}&rdquo; and its tick history. Other habits are not
              affected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}