
export type User = {
  id: string; // This will be the Firebase Auth UID
  username: string; // This should be an email
  password?: string; // Only used for creation, not stored
  role: "admin" | "user";
};

export type CalendarWindow = {
  id: string; // Firestore document ID
  day: number;
  message: string;
  imageUrl: string;
  imageHint: string;
  videoUrl: string;
  manualState: "default" | "unlocked" | "locked";
};
