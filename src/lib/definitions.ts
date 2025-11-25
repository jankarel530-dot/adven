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
  manualState: "default" | "unlocked" | "locked";
};
