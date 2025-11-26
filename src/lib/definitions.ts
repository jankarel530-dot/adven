export type User = {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "user";
};

export type CalendarWindow = {
  day: number;
  message: string;
  imageUrl: string;
  imageHint: string;
  videoUrl?: string; // Add optional videoUrl
  manualState: "default" | "unlocked" | "locked";
};
