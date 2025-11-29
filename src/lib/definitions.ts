export type User = {
  id: string;
  username: string;
  password?: string;
  role: "admin" | "user";
};

export type CalendarWindow = {
  id: string; // Added ID for Firestore
  day: number;
  message: string;
  imageUrl: string;
  imageHint: string;
  videoUrl?: string;
  manualState: "default" | "unlocked" | "locked";
};
