"use client";

import { useFormState, useFormStatus } from "react-dom";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateWindow } from "@/lib/actions";
import { CalendarWindow } from "@/lib/definitions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { Bold, Italic } from "lucide-react";

export default function WindowManagement({
  windows,
}: {
  windows: CalendarWindow[];
}) {
  return (
    <Card>
        <CardHeader>
            <CardTitle>Editor Okének</CardTitle>
            <CardDescription>Kliknutím na den rozbalíte editor pro úpravu obsahu a stavu okénka.</CardDescription>
        </CardHeader>
        <CardContent>
            <Accordion type="single" collapsible className="w-full">
            {windows.map((window) => (
                <AccordionItem key={window.day} value={`item-${window.day}`}>
                <AccordionTrigger className="font-headline text-lg">
                    Den {window.day}
                </AccordionTrigger>
                <AccordionContent>
                    <WindowForm windowData={window} />
                </AccordionContent>
                </AccordionItem>
            ))}
            </Accordion>
      </CardContent>
    </Card>
  );
}

function WindowForm({ windowData }: { windowData: CalendarWindow }) {
  const [state, action] = useFormState(updateWindow, undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.errors) {
        toast({ title: `Chyba při úpravě dne ${windowData.day}`, description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Úspěch", description: state.message });
      }
    }
  }, [state, toast, windowData.day]);
  
  const applyFormat = (tag: 'b' | 'i') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const textBefore = textarea.value.substring(0, start);
    const textAfter = textarea.value.substring(end);

    const newText = `${textBefore}<${tag}>${selectedText}</${tag}>${textAfter}`;
    
    // This is a simplified way to update the value for React
    const nativeTextareaSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
    nativeTextareaSetter?.call(textarea, newText);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));

    textarea.focus();
    textarea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
  };


  return (
    <form ref={formRef} action={action} className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <input type="hidden" name="day" value={windowData.day} />
        
        <div>
          <Label htmlFor={`message-${windowData.day}`}>Zpráva</Label>
          <div className="flex gap-2 mb-2">
             <Button type="button" variant="outline" size="icon" onClick={() => applyFormat('b')}><Bold/></Button>
             <Button type="button" variant="outline" size="icon" onClick={() => applyFormat('i')}><Italic/></Button>
          </div>
          <Textarea
            ref={textareaRef}
            id={`message-${windowData.day}`}
            name="message"
            defaultValue={windowData.message}
            className="min-h-[100px]"
          />
        </div>
        
        <div>
          <Label htmlFor={`imageUrl-${windowData.day}`}>URL obrázku</Label>
          <Input
            id={`imageUrl-${windowData.day}`}
            name="imageUrl"
            defaultValue={windowData.imageUrl}
          />
        </div>

        <div>
          <Label htmlFor={`videoUrl-${windowData.day}`}>URL videa (YouTube)</Label>
          <Input
            id={`videoUrl-${windowData.day}`}
            name="videoUrl"
            defaultValue={windowData.videoUrl}
            placeholder="např. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
        </div>
        
        <div>
          <Label>Manuální ovládání</Label>
          <RadioGroup name="manualState" defaultValue={windowData.manualState} className="mt-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="default" id={`default-${windowData.day}`} />
              <Label htmlFor={`default-${windowData.day}`}>Výchozí (podle data)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unlocked" id={`unlocked-${windowData.day}`} />
              <Label htmlFor={`unlocked-${windowData.day}`}>Vždy odemčeno</Label>
            </div>
             <div className="flex items-center space-x-2">
              <RadioGroupItem value="locked" id={`locked-${windowData.day}`} />
              <Label htmlFor={`locked-${windowData.day}`}>Vždy zamčeno</Label>
            </div>
          </RadioGroup>
        </div>
        
        <SubmitButton />
      </div>
      <div className="flex items-center justify-center">
        <Image 
            src={windowData.imageUrl}
            alt={`Preview for day ${windowData.day}`}
            width={300}
            height={200}
            className="rounded-md object-cover"
            data-ai-hint={windowData.imageHint}
        />
      </div>
    </form>
  );
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} variant="accent">
        {pending ? "Ukládání..." : "Uložit změny"}
        </Button>
    );
}
