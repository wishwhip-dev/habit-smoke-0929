import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { dayOfMonthLabel, weekdayLabel } from "@/lib/dates";

/**
 * The last-seven-days chart for one habit.
 *
 * Seven labelled cells, oldest first, one per calendar day: filled for days with a tick, empty
 * for days without, and today outlined so it is obvious which day is which. Sized by the grid —
 * `grid-cols-7` with `min-w-0` — so it fits a phone viewport without horizontal scrolling.
 */
export function WeekChart({ dates, ticked, today }: { dates: string[]; ticked: Set<string>; today: string }) {
  return (
    <div
      role="img"
      aria-label={`Last 7 days: ${ticked.size} of 7 done`}
      className="grid w-full grid-cols-7 gap-1"
    >
      {dates.map((date) => {
        const done = ticked.has(date);
        const isToday = date === today;
        return (
          <div key={date} className="flex min-w-0 flex-col items-center gap-1">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-wide",
                isToday ? "text-primary" : "text-muted-foreground",
              )}
            >
              {weekdayLabel(date)}
            </span>
            <div
              title={`${date}${done ? " — done" : " — not done"}`}
              className={cn(
                "grid h-8 w-full min-w-0 place-content-center rounded-md border text-xs sm:h-9",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-muted/50 text-muted-foreground",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <span>{dayOfMonthLabel(date)}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}