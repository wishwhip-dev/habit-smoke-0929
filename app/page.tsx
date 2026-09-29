import { HabitTracker } from "@/components/habits/habit-tracker";

export default function Home() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-2xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Habit tracker</h1>
        <p className="mt-1 text-muted-foreground">
          Tick off each habit once a day. Everything is saved in this browser and waits for you
          tomorrow.
        </p>
      </header>
      <HabitTracker />
    </main>
  );
}