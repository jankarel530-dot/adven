"use client";

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Gift } from "lucide-react";

export default function NotificationHandler() {
  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    const isDecember = today.getMonth() === 11;
    
    if (!isDecember) return;

    const dayOfMonth = today.getDate();

    if (dayOfMonth > 24) return;
    
    const notificationKey = `notification_day_${dayOfMonth}`;
    const hasBeenNotified = sessionStorage.getItem(notificationKey);

    if (!hasBeenNotified) {
      toast({
        title: "Nové okénko odemčeno!",
        description: `Dnes je ${dayOfMonth}. prosince. Pojďte se podívat, co se skrývá v dnešním okénku!`,
        action: <Gift className="text-primary" />,
      });
      sessionStorage.setItem(notificationKey, "true");
    }
  }, [toast]);

  return null;
}
