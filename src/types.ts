export type Screen = "subject" | "chapter" | "diagnostic" | "session" | "dashboard" | "celebration";
export type ActivityMode = "story" | "activity" | "redirect" | "chapter-break";

export interface AIEntry {
  type: "info" | "decision" | "warning" | "success";
  label: string;
  text: string;
  time: string;
}

export interface MasteryItem {
  name: string;
  pct: number;
}
