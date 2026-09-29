"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addHabit } from "@/lib/data/habits";

/**
 * The add-habit form, sitting directly on the page.
 *
 * Submits to the database and reports failures inline: an empty name adds nothing, and a name
 * that already exists is refused rather than creating a duplicate.
 */
export function AddHabitForm({ className }: { className?: string }) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await addHabit(name);
      if (result.ok) {
        setName("");
        setError(null);
      } else {
        setError(result.error);
      }
    } catch (cause) {
      // A failed write tells the person so — nothing is added, and they see why.
      setError(cause instanceof Error ? cause.message : "Could not save the habit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const errorId = "add-habit-error";

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="grid flex-1 gap-1.5">
          <Label htmlFor="habit-name">Habit name</Label>
          <Input
            id="habit-name"
            name="habit-name"
            placeholder="e.g. Drink water"
            value={name}
            autoComplete="off"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            onChange={(event) => {
              setName(event.target.value);
              if (error) setError(null);
            }}
          />
        </div>
        <Button type="submit" disabled={submitting} className="h-10 sm:w-24">
          {submitting ? "Adding…" : "Add"}
        </Button>
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </form>
  );
}