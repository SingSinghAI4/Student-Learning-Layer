export type Screen = "subject" | "chapter" | "avatar-picker" | "diagnostic" | "session" | "dashboard" | "celebration" | "ai-monitor";
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
