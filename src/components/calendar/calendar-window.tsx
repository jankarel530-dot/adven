
"use client";

import Image from "next/image";
import { Lock, Gift, Snowflake } from "lucide-react";
import { CalendarWindow as CalendarWindowType } from "@/lib/definitions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChristmasTreeIcon, OrnamentIcon } from "../icons";
import { useState } from "react";
import { cn } from "@/lib/utils";

type CalendarWindowProps = {
  window: CalendarWindowType;
  isUnlocked: boolean;
  isOpened: boolean;
  onOpen: (day: number) => void;
};

export default function CalendarWindow({
  window,
  isUnlocked,
  isOpened,
  onOpen,
}: CalendarWindowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpen = () => {
    if (isUnlocked) {
      if (!isOpened) {
        const audio = new Audio("/sounds/jingle.mp3");
        audio.play().catch((e) => console.error("Error playing sound:", e));
        onOpen(window.day);
      }
      setIsDialogOpen(true);
    }
  };

  const Icon = isUnlocked ? Gift : Lock;

  const content = (
    <Card
      className={cn(
        "aspect-square flex flex-col items-center justify-center transition-all duration-300 ease-in-out cursor-pointer group",
        !isUnlocked &&
          "cursor-not-allowed bg-secondary text-secondary-foreground opacity-70",
        isUnlocked &&
          !isOpened &&
          "bg-destructive text-destructive-foreground hover:scale-105 hover:shadow-lg hover:bg-destructive/90",
        isUnlocked &&
          isOpened &&
          "bg-muted hover:scale-105 hover:shadow-lg"
      )}
      onClick={handleOpen}
    >
      <CardContent className="p-2 flex flex-col items-center justify-center gap-2 text-center">
        <Icon className="h-6 w-6 sm:h-8 sm:w-8" />
        <p className={cn(
          "text-2xl sm:text-4xl font-black [text-shadow:0_1px_2px_rgba(0,0,0,0.2)]",
          !isUnlocked && "text-destructive",
          isUnlocked && !isOpened && "text-destructive-foreground",
          isUnlocked && isOpened && "text-muted-foreground",
        )}>
          {window.day}
        </p>
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

  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return url;
  };

  const hasMedia = window.imageUrl || window.videoUrl;
  const embedVideoUrl = window.videoUrl ? getEmbedUrl(window.videoUrl) : null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{content}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px] overflow-hidden">
        <OrnamentIcon className="absolute -top-4 -left-5 h-16 w-16 text-primary/30 rotate-[-30deg] opacity-50" />
        <Snowflake className="absolute -top-3 -right-4 h-16 w-16 text-primary/30 rotate-[20deg] opacity-50" />
        <div className="border-2 border-dashed border-primary/50 p-6 rounded-lg">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl flex items-center gap-2">
              <ChristmasTreeIcon className="h-8 w-8 text-primary" />
              Adventní Okénko: {window.day}. prosince
            </DialogTitle>
            <DialogDescription
              dangerouslySetInnerHTML={{ __html: window.message }}
            />
          </DialogHeader>
          {hasMedia && (
            <div className="mt-4 aspect-video w-full">
              {embedVideoUrl ? (
                <iframe
                  src={embedVideoUrl}
                  title={`Advent content for day ${window.day}`}
                  className="w-full h-full rounded-md"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : window.imageUrl ? (
                <Image
                  src={window.imageUrl}
                  alt={`Advent content for day ${window.day}`}
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full h-full"
                  data-ai-hint={window.imageHint}
                />
              ) : null}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
