
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

const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const videoId = new URL(url).searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }
      if (url.includes("youtu.be/")) {
        const videoId = new URL(url).pathname.slice(1);
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
      }
    } catch (e) {
      console.error("Invalid video URL", e);
      return '';
    }
    return '';
};

function WindowForm({ windowData }: { windowData: CalendarWindow }) {
  const [state, action] = useFormState(updateWindow, undefined);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  // States for controlled components
  const [message, setMessage] = useState(windowData.message || '');
  const [imageUrl, setImageUrl] = useState(windowData.imageUrl || '');
  const [videoUrl, setVideoUrl] = useState(windowData.videoUrl || '');

  useEffect(() => {
    if (state?.message) {
      if (state.isError || state.errors) {
        toast({ title: `Chyba u dne ${windowData.day}`, description: state.message, variant: "destructive" });
      } else {
        toast({ title: "Úspěch", description: state.message });
      }
    }
  }, [state, toast, windowData.day]);
  
  const applyFormat = (tag: 'b' | 'i') => {
    const textarea = formRef.current?.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText) {
        const newText = `${textarea.value.substring(0, start)}<${tag}>${selectedText}</${tag}>${textarea.value.substring(end)}`;
        setMessage(newText);
        
        textarea.focus();
        setTimeout(() => {
            textarea.setSelectionRange(start + tag.length + 2, end + tag.length + 2);
        }, 0);
    }
  };

  const embedVideoUrl = getEmbedUrl(videoUrl);

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
            id={`message-${windowData.day}`}
            name="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
            <Label>Náhled zprávy</Label>
            <div 
              className="min-h-[100px] w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-sm whitespace-pre-wrap"
              dangerouslySetInnerHTML={{ __html: message || "Zde se zobrazí náhled..." }}
            />
        </div>
        
        <div>
          <Label htmlFor={`imageUrl-${windowData.day}`}>URL obrázku</Label>
          <Input
            id={`imageUrl-${windowData.day}`}
            name="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="např. https://images.unsplash.com/..."
          />
        </div>

        <div>
          <Label htmlFor={`videoUrl-${windowData.day}`}>URL videa (YouTube)</Label>
          <Input
            id={`videoUrl-${windowData.day}`}
            name="videoUrl"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="např. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          />
        </div>
        
        <div>
          <Label>Manuální ovládání</Label>
          <RadioGroup name="manualState" defaultValue={windowData.manualState || 'default'} className="mt-2">
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
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center bg-muted/50 rounded-md aspect-video">
            {embedVideoUrl ? (
                <iframe
                    key={embedVideoUrl} // Force re-render on URL change
                    src={embedVideoUrl}
                    title={`Preview for day ${windowData.day}`}
                    className="w-full h-full rounded-md"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : imageUrl ? (
                <Image 
                    src={imageUrl}
                    alt={`Preview for day ${windowData.day}`}
                    width={300}
                    height={200}
                    className="rounded-md object-cover"
                    data-ai-hint={windowData.imageHint}
                />
            ) : (
                <div className="text-muted-foreground text-center p-4">
                    <p>Žádný mediální obsah.</p>
                    <p className="text-xs">Zadejte URL obrázku nebo videa.</p>
                </div>
            )}
        </div>
        
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
