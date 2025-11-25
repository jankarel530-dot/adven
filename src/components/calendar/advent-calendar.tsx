"use client";

import { useEffect, useState } from "react";
import { CalendarWindow as CalendarWindowType } from "@/lib/definitions";
import CalendarWindow from "./calendar-window";

type AdventCalendarProps = {
  windows: CalendarWindowType[];
};

export default function AdventCalendar({ windows }: AdventCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date());
  }, []);

  if (!currentDate) {
    // You can render a loader here
    return (
       <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted"></div>
        ))}
      </div>
    );
  }

  const isDecember = currentDate.getMonth() === 11;

  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
      {windows.map((window) => {
        const windowDate = new Date(currentDate.getFullYear(), 11, window.day);
        
        let isUnlocked = false;
        if (window.manualState === 'unlocked') {
            isUnlocked = true;
        } else if (window.manualState === 'locked') {
            isUnlocked = false;
        } else {
            isUnlocked = isDecember && currentDate >= windowDate;
        }

        return (
          <CalendarWindow
            key={window.day}
            window={window}
            isUnlocked={isUnlocked}
          />
        );
      })}
    </div>
  );
}
