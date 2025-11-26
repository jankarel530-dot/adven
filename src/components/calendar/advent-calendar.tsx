"use client";

import { useEffect, useState, useMemo } from "react";
import { CalendarWindow as CalendarWindowType } from "@/lib/definitions";
import CalendarWindow from "./calendar-window";

type AdventCalendarProps = {
  windows: CalendarWindowType[];
};

export default function AdventCalendar({ windows }: AdventCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [openedWindows, setOpenedWindows] = useState<Set<number>>(new Set());

  useEffect(() => {
    // This ensures date-dependent logic only runs on the client
    setCurrentDate(new Date());

    const storedOpenedWindows = localStorage.getItem("openedAdventWindows");
    if (storedOpenedWindows) {
      try {
        const parsed = JSON.parse(storedOpenedWindows);
        if (Array.isArray(parsed)) {
          setOpenedWindows(new Set(parsed));
        }
      } catch (e) {
        console.error("Failed to parse opened windows from localStorage", e);
        setOpenedWindows(new Set());
      }
    }
  }, []);

  const handleOpenWindow = (day: number) => {
    if (openedWindows.has(day)) return;
    const newOpenedWindows = new Set(openedWindows);
    newOpenedWindows.add(day);
    setOpenedWindows(newOpenedWindows);
    localStorage.setItem("openedAdventWindows", JSON.stringify(Array.from(newOpenedWindows)));
  };
  
  if (!currentDate) {
    // Show a loading state until the client has mounted and set the date
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
        let isUnlocked: boolean;
        if (window.manualState === 'unlocked') {
            isUnlocked = true;
        } else if (window.manualState === 'locked') {
            isUnlocked = false;
        } else { // 'default'
            isUnlocked = isDecember && currentDate.getDate() >= window.day;
        }

        const isOpened = openedWindows.has(window.day);

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
