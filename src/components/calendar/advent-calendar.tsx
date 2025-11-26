"use client";

import { useEffect, useState } from "react";
import { CalendarWindow as CalendarWindowType } from "@/lib/definitions";
import CalendarWindow from "./calendar-window";

type AdventCalendarProps = {
  windows: CalendarWindowType[];
};

export default function AdventCalendar({ windows }: AdventCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [openedWindows, setOpenedWindows] = useState<number[]>([]);

  useEffect(() => {
    // Set date on client to avoid hydration mismatch
    setCurrentDate(new Date());

    // Load opened windows from local storage
    const storedOpenedWindows = localStorage.getItem("openedAdventWindows");
    if (storedOpenedWindows) {
      try {
        const parsed = JSON.parse(storedOpenedWindows);
        if (Array.isArray(parsed)) {
            setOpenedWindows(parsed);
        }
      } catch (e) {
        console.error("Failed to parse opened windows from localStorage", e);
        setOpenedWindows([]);
      }
    }
  }, []);

  const handleOpenWindow = (day: number) => {
    if (openedWindows.includes(day)) return;
    const newOpenedWindows = [...openedWindows, day];
    setOpenedWindows(newOpenedWindows);
    localStorage.setItem("openedAdventWindows", JSON.stringify(newOpenedWindows));
  };
  
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
        
        let isUnlocked: boolean;
        if (window.manualState === 'unlocked') {
            isUnlocked = true;
        } else if (window.manualState === 'locked') {
            isUnlocked = false;
        } else { // 'default'
            isUnlocked = isDecember && currentDate >= windowDate;
        }

        const isOpened = openedWindows.includes(window.day);

        return (
          <CalendarWindow
            key={window.day}
            window={window}
            isUnlocked={isUnlocked}
            isOpened={isOpened}
            onOpen={handleOpenWindow}
          />
        );
      })}
    </div>
  );
}