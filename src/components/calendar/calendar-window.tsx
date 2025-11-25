"use client";

import Image from "next/image";
import { Lock, Gift } from "lucide-react";
import { CalendarWindow as CalendarWindowType } from "@/lib/definitions";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChristmasTreeIcon } from "../icons";

type CalendarWindowProps = {
  window: CalendarWindowType;
  isUnlocked: boolean;
};

export default function CalendarWindow({ window, isUnlocked }: CalendarWindowProps) {
  const Icon = isUnlocked ? Gift : Lock;

  const content = (
    <Card
      className={`aspect-square flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
        isUnlocked
          ? "cursor-pointer bg-secondary hover:scale-105 hover:shadow-lg"
          : "cursor-not-allowed bg-muted opacity-70"
      }`}
    >
      <CardContent className="p-2 flex flex-col items-center justify-center gap-2 text-center">
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${isUnlocked ? 'text-accent' : 'text-muted-foreground'}`} />
        <p className="text-2xl sm:text-4xl font-bold font-headline text-primary">{window.day}</p>
      </CardContent>
    </Card>
  );

  if (!isUnlocked) {
    return (
      <div aria-disabled="true" aria-label={`Day ${window.day}, locked`}>
        {content}
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{content}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-3xl flex items-center gap-2">
            <ChristmasTreeIcon className="h-8 w-8 text-primary" />
            Adventní Okénko: {window.day}. prosince
          </DialogTitle>
          <DialogDescription>{window.message}</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <Image
            src={window.imageUrl}
            alt={`Advent content for day ${window.day}`}
            width={600}
            height={400}
            className="rounded-md object-cover"
            data-ai-hint={window.imageHint}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
