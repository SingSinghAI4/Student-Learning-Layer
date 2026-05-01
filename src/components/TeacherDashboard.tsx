import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CLASS_STUDENTS } from "../data";

// ── Types ──────────────────────────────────────────────
type FilterStatus = "all" | "flying" | "attention" | "inactive" | "on-track";

interface Alert {
  id: number;
  student: string;
  type: "critical" | "warning" | "info";
  title: string;
  body: string;
  action: string;
  dismissed: boolean;
}

// ── Mock data ──────────────────────────────────────────
const TEACHER = { name: "Ms. Karo", school: "Waigani Primary School", grade: 2 };

const INITIAL_ALERTS: Alert[] = [
  { id: 1, student: "Peni",  type: "critical", title: "Absent 3 Days",           body: "No session since Monday. Last activity: Phonics Ch.2. Consider parent contact.",          action: "Send Alert",    dismissed: false },
  { id: 2, student: "Peter", type: "critical", title: "Absent 5 Days",           body: "Persistent absence. May require home visit or school admin escalation.",                  action: "Escalate",      dismissed: false },
  { id: 3, student: "Beni",  type: "warning",  title: "Letter Reversal — b/d",   body: "3 sessions on same concept. Platform switched to visual support. Review recommended.",   action: "View Progress", dismissed: false },
  { id: 4, student: "Walo",  type: "warning",  title: "Response Time Increasing", body: "Slowing over 2 sessions. Possible fatigue or difficulty. Monitor closely.",             action: "Monitor",       dismissed: false },
  { id: 5, student: "Kila",  type: "info",     title: "Ready to Advance",        body: "Mastery at 87%. Performing above Grade 2 level. Consider Grade 3 placement review.",     action: "Confirm",       dismissed: false },
  { id: 6, student: "Hera",  type: "info",     title: "Top Performer",           body: "91% mastery — highest in class. Recommended for accelerated Grade 3 track.",             action: "Review",        dismissed: false },
];

// ── SVG icons ──────────────────────────────────────────
const IconTrendUp = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);
const IconAlert = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconUserOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="1" x2="17" y2="7"/><line x1="17" y1="1" x2="23" y2="7"/>
  </svg>
);
const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IconBrain = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7H4a2 2 0 00-2 2v1a2 2 0 002 2h.5A2.5 2.5 0 017 14.5v0A2.5 2.5 0 019.5 17H10v3a2 2 0 004 0v-3h.5A2.5 2.5 0 0117 14.5v0A2.5 2.5 0 0119.5 12H20a2 2 0 002-2V9a2 2 0 00-2-2h-.5A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0114.5 2h-5z"/>
  </svg>
);

// ── AI Insights ────────────────────────────────────────
const AI_INSIGHTS = {
  summary: "Overall, Grade 2 is tracking well this week. 78% of students are progressing at or above the expected pace for Term 2. Literacy comprehension has improved across the cohort since last week, likely driven by the new story-based activities in Chapters 3–4. However, numeracy — specifically number bonds and addition strategies — remains a gap for approximately 4 students who may benefit from small-group intervention.",
  observations: [
    {
      Icon: IconTrendUp,
      color: "#16a34a",
      bg: "#f0fdf4",
      label: "Positive Trend",
      text: "Kila, Hera, Soki, and James are performing significantly above grade level. Their mastery scores suggest they are ready for more complex tasks. Consider differentiated extension activities or peer-tutoring roles to keep engagement high.",
    },
    {
      Icon: IconAlert,
      color: "#d97706",
      bg: "#fffbeb",
      label: "Numeracy Gap",
      text: "Beni, Walo, and Waina have each spent more than 3 sessions on similar numeracy concepts without consolidation. The platform has adapted with visual scaffolding, but a teacher-led small-group session this week would likely accelerate progress more than additional solo practice.",
    },
    {
      Icon: IconUserOff,
      color: "#dc2626",
      bg: "#fef2f2",
      label: "Attendance Concern",
      text: "Peni and Peter have not completed a session in 3 and 5 days respectively. Their last known concept — Phonics Ch.2 — was incomplete. Extended absence at this stage risks concept gaps compounding. A direct parent or community contact is recommended before the end of this week.",
    },
    {
      Icon: IconTarget,
      color: "#2563eb",
      bg: "#eff6ff",
      label: "This Week's Focus",
      text: "Based on class-wide performance data, the AI recommends prioritising oral reading fluency and number bond revision in your next classroom session. 9 of 18 students are approaching the Chapter 4 checkpoint — a group session on story comprehension strategies would benefit the majority of the class simultaneously.",
    },
  ],
};

// ── Per-student AI feedback ────────────────────────────
interface StudentFeedback {
  summary: string;
  strengths: string[];
  focusArea: { concept: string; detail: string };
  recommendation: string;
}

const STUDENT_FEEDBACK: Record<string, StudentFeedback> = {
  Kila: {
    summary: "Kila is performing exceptionally well across all areas. With an 87% mastery score and consistent daily engagement, she is tracking significantly above the expected Grade 2 benchmark for Term 2.",
    strengths: ["Completes tasks 40% faster than class average", "Consistent daily logins — no missed sessions this term", "Demonstrates strong number sense; self-corrects errors without prompting"],
    focusArea: { concept: "Addition (Advanced)", detail: "Kila has mastered basic addition. She is ready for multi-step and word-problem variants. Staying on foundational work risks disengagement." },
    recommendation: "Introduce Grade 3 extension tasks or peer-tutoring role to maintain challenge and motivation. Consider a differentiated pathway within the platform.",
  },
  Beni: {
    summary: "Beni has spent 3 consecutive sessions on letter reversal (b/d) without consolidation. The platform has adapted with visual scaffolding, but progress has stalled and teacher intervention is likely the most effective next step.",
    strengths: ["High engagement — averages 18 minutes per session", "Strong verbal responses; difficulty appears visual-perceptual, not conceptual", "Responds well to visual cues introduced last session"],
    focusArea: { concept: "Letter Reversal — b/d", detail: "This is a common but persistent challenge. Repeated platform practice alone may reinforce confusion. A hands-on, embodied approach (e.g. forming letters with clay, finger tracing) tends to be more effective for this specific issue." },
    recommendation: "Run a 10-minute small-group session using tactile letter formation. Pair with Kila or Hera as a peer-reading buddy to reinforce phonics in context.",
  },
  Meri: {
    summary: "Meri is progressing steadily at 65% mastery. She is on track for the Term 2 checkpoint and shows consistent effort, though she occasionally needs extra time to consolidate concepts before moving forward.",
    strengths: ["Reliable daily engagement — no absences this term", "Demonstrates patience and persistence when concepts are difficult", "Strong oral reading fluency observed in recent sessions"],
    focusArea: { concept: "Counting (Skip Counting)", detail: "Meri is accurate with sequential counting but slows significantly on skip counting by 2s and 5s. This is a prerequisite for multiplication readiness in Term 3." },
    recommendation: "Incorporate number line activities and pattern-based counting games. 5–10 minutes of skip counting practice before each session would accelerate consolidation.",
  },
  Tama: {
    summary: "Tama is progressing well at 71% mastery. He engages confidently with sentence construction tasks and shows a good understanding of basic grammar. Consistency is his key strength.",
    strengths: ["Above-average sentence length and complexity for Grade 2", "Positive attitude — attempts tasks without hesitation", "Responds well to story-based prompts"],
    focusArea: { concept: "Sentences (Punctuation)", detail: "Tama consistently omits full stops and capital letters in written responses. He understands sentence structure but hasn't automatised punctuation rules yet." },
    recommendation: "Brief daily punctuation drills using his own sentences as examples. Peer review exercise with a partner to develop editing awareness.",
  },
  Saina: {
    summary: "Saina is performing consistently in the progressing band at 68% mastery. She is a reliable learner who benefits from structured tasks and clear instructions.",
    strengths: ["Strong recall of previously taught concepts", "Neat and methodical approach to problem solving", "Rarely needs to repeat instructions"],
    focusArea: { concept: "Subtraction", detail: "Saina is accurate with single-digit subtraction but shows uncertainty when regrouping (borrowing) is required. She tends to revert to counting-on strategies rather than using place value." },
    recommendation: "Introduce concrete place-value materials (base-10 blocks) or visual models. Praise use of efficient strategies to build confidence with regrouping.",
  },
  Peni: {
    summary: "Peni has not completed a session in 3 days. Her last activity was an incomplete Phonics Chapter 2 module. Extended absence at this stage risks compounding concept gaps, particularly in foundational phonics.",
    strengths: ["When present, shows genuine interest in story-based activities", "Demonstrated strong phonemic awareness in earlier sessions", "Positive peer relationships — engages well in group tasks"],
    focusArea: { concept: "Phonics — Ch. 2 (incomplete)", detail: "Chapter 2 covers short vowel sounds and CVC word blending — foundational skills needed for all upcoming reading tasks. Leaving this incomplete blocks progress across multiple strands." },
    recommendation: "Attempt parent or community contact before end of week. If Peni returns, begin with a brief Chapter 2 recap before continuing. Avoid skipping ahead.",
  },
  Hera: {
    summary: "Hera is the top performer in the class at 91% mastery. She is operating well above Grade 2 expectations and her current tasks may no longer be sufficiently challenging.",
    strengths: ["Highest mastery score in the class", "Completes tasks accurately and quickly — often first to finish", "Strong reading comprehension and vocabulary"],
    focusArea: { concept: "Word Matching (Needs Extension)", detail: "Hera is excelling at current word matching tasks but the challenge level is too low. Without extension, there is a risk of complacency or disengagement." },
    recommendation: "Flag for accelerated Grade 3 placement review. In the meantime, assign extension reading comprehension tasks and consider a junior tutoring role for Word Matching activities.",
  },
  Walo: {
    summary: "Walo's response times have been increasing across the last two sessions. At 41% mastery, he is in the at-risk band and may be experiencing fatigue, difficulty, or reduced motivation. Closer monitoring and support are recommended.",
    strengths: ["Tries hard — rarely gives up mid-task", "Social and engaged when working in group contexts", "Strong verbal reasoning observed during oral tasks"],
    focusArea: { concept: "Number Bonds", detail: "Walo has attempted number bond tasks 4 times without reaching consolidation. The platform has adjusted difficulty but the concept gap appears deeper than scaffolding alone can address." },
    recommendation: "Schedule a 15-minute one-on-one or small-group session focused on concrete number bond activities using physical objects. Check for potential barriers (home factors, fatigue, vision) if response times continue to decline.",
  },
  Karo: {
    summary: "Karo is progressing comfortably at 73% mastery. She is a well-rounded learner who reads with fluency and understands context well. A minor plateau in the past week is worth monitoring.",
    strengths: ["Fluent oral reader — above average for Grade 2", "Infers meaning from context without needing explicit definitions", "Strong listening comprehension"],
    focusArea: { concept: "Reading (Comprehension Questions)", detail: "Karo reads well but struggles to answer inferential comprehension questions in writing. She often describes what happened rather than explaining why." },
    recommendation: "Introduce 'think aloud' comprehension strategies. Prompts like 'How do you know?' and 'What made the character feel that way?' help develop inferential reasoning.",
  },
  Naomi: {
    summary: "Naomi is tracking steadily at 60% mastery. She is an attentive learner who benefits from encouragement and structured tasks. A small boost in daily engagement time could accelerate her progress.",
    strengths: ["Attentive and focused during sessions", "Follows multi-step instructions reliably", "Positive attitude toward feedback"],
    focusArea: { concept: "Counting (Teen Numbers)", detail: "Naomi counts reliably to 20 but makes errors with teen numbers (13 vs 30, 14 vs 40). This place-value confusion is common at this stage but needs targeted practice." },
    recommendation: "Use number cards and place-value mats to visually differentiate teens from tens. Short daily practice (5 minutes) will be more effective than longer, infrequent sessions.",
  },
  Soki: {
    summary: "Soki is performing strongly at 84% mastery. He is a confident, independent learner who consistently meets or exceeds task expectations. He is on track for an outstanding end-of-term assessment.",
    strengths: ["High independence — rarely needs re-prompting", "Strong sentence construction with correct subject-verb agreement", "Consistent engagement — 5 sessions this week"],
    focusArea: { concept: "Sentences (Complex Structures)", detail: "Soki has mastered simple and compound sentences. Introducing complex sentence structures (subordinate clauses) would appropriately challenge him at this stage." },
    recommendation: "Extend writing tasks to include 'because', 'when', 'although' sentence starters. Introduce a short creative writing component to apply skills in an open-ended context.",
  },
  Waina: {
    summary: "Waina is at 38% mastery and has spent significant time on letter sound tasks without consolidation. She is at risk of falling behind the class cohort if foundational phonics gaps are not addressed soon.",
    strengths: ["High time-on-task — averaging 22 minutes per session", "Motivated and persistent — does not give up easily", "Good visual memory for whole words, even when sounds are unclear"],
    focusArea: { concept: "Letter Sounds (Blending)", detail: "Waina identifies individual sounds accurately but struggles to blend them into words fluently. This blending gap is a critical bottleneck for reading readiness." },
    recommendation: "Use continuous blending techniques (slow-speed blending rather than segmented sounds). Consider a structured phonics intervention program (e.g. daily 10-minute decodable text reading) alongside platform sessions.",
  },
  John: {
    summary: "John is progressing at 55% mastery. He is a solid mid-range learner who responds well to structured tasks. A slight increase in session consistency would help him move from the lower progressing band to a stronger position.",
    strengths: ["Good number sense for quantities under 20", "Responds well to visual representations", "Friendly and cooperative during peer activities"],
    focusArea: { concept: "Addition (Carrying)", detail: "John is confident with single-digit addition but hesitates with two-digit problems requiring carrying. He tends to recount from 1 rather than using efficient strategies." },
    recommendation: "Introduce 'make 10' and 'bridging' strategies using number lines. Consistent daily practice of 5 problems at the edge of his current ability will build automaticity.",
  },
  Rosa: {
    summary: "Rosa is performing well at 62% mastery. She is a careful, methodical learner who prefers to check her work before submitting. Her accuracy rate is higher than her speed might suggest.",
    strengths: ["High accuracy rate — makes few careless errors", "Self-checking behaviour indicates strong metacognitive awareness", "Responds positively to written and visual feedback"],
    focusArea: { concept: "Subtraction (Word Problems)", detail: "Rosa is confident with number-only subtraction but struggles to decode word problems — identifying what operation is needed and what to subtract." },
    recommendation: "Introduce a consistent word problem strategy (e.g. underline the question, circle key numbers, draw a diagram). Practice with 2–3 problems per session until the strategy becomes automatic.",
  },
  Peter: {
    summary: "Peter has not logged in for 5 days. His last completed activity was an early phonics module and his mastery remains at 15%. This is the most concerning attendance situation in the class and likely requires escalation.",
    strengths: ["Showed enthusiasm in initial sessions — strong early engagement", "Responded positively to audio-based activities", "Good phonemic awareness at the start of term"],
    focusArea: { concept: "Phonics — Foundational (incomplete)", detail: "Peter's foundational phonics work is incomplete. Without intervention, he risks entering the next term with significant literacy gaps that will compound across all subjects." },
    recommendation: "Escalate to school administration for a welfare check. Prepare a structured re-engagement plan for when Peter returns, starting with a short achievement task to rebuild confidence.",
  },
  Mary: {
    summary: "Mary is progressing well at 70% mastery. She is a consistent, engaged learner who reads with good comprehension. She is close to the Chapter 4 checkpoint and likely to reach it by end of week.",
    strengths: ["Consistent daily engagement — no missed sessions this week", "Strong reading comprehension — above average for Grade 2", "Asks questions when unsure — shows metacognitive strength"],
    focusArea: { concept: "Reading (Fluency Rate)", detail: "Mary reads accurately but at a slower pace than expected for her comprehension level. Increasing reading fluency will support her across all literacy tasks." },
    recommendation: "Introduce short timed reading activities (1-minute fluency checks) using decodable texts. Repeated reading of familiar texts improves both speed and confidence.",
  },
  James: {
    summary: "James is an outstanding performer at 89% mastery. He is consistently the fastest to complete tasks and demonstrates strong mathematical reasoning well above Grade 2 expectations.",
    strengths: ["Fastest task completion in the class — consistently finishes first", "Strong abstract reasoning in math tasks", "Applies known strategies to unfamiliar problems independently"],
    focusArea: { concept: "Math (Needs Advanced Extension)", detail: "James has exhausted the current Grade 2 math content. Continuation at this level risks disengagement and boredom. He needs extension material at Grade 3–4 level." },
    recommendation: "Immediately assign Grade 3 math extension content. Consider James for an accelerated numeracy pathway or enrichment programme. He may also benefit from explaining strategies to peers as a consolidation and leadership activity.",
  },
  Grace: {
    summary: "Grace is progressing at 64% mastery. She is a thoughtful learner who takes her time with written tasks and produces careful, considered responses. She is on track for the end-of-term checkpoint.",
    strengths: ["Produces well-structured sentences with good vocabulary choices", "Strong creative thinking in open-ended tasks", "Consistently positive attitude — high effort across all tasks"],
    focusArea: { concept: "Sentences (Length and Detail)", detail: "Grace writes accurate but brief sentences. She has the vocabulary and ideas to elaborate but tends to stop at the minimum required. Encouragement to expand and explain would significantly improve her writing quality." },
    recommendation: "Use 'say more' sentence extension prompts. Ask Grace to add 'because', 'so that', or 'which means' to each sentence she writes. Celebrate expanded responses explicitly.",
  },
};

// ── Professional status labels ─────────────────────────
const STATUS_LABEL: Record<string, string> = {
  flying:    "Excelling",
  "on-track":"Progressing",
  attention: "At Risk",
  inactive:  "Absent",
};

const STATUS_COLOR: Record<string, string> = {
  flying:    "#16a34a",
  "on-track":"#2563eb",
  attention: "#d97706",
  inactive:  "#dc2626",
};

const STATUS_BG: Record<string, string> = {
  flying:    "#f0fdf4",
  "on-track":"#eff6ff",
  attention: "#fffbeb",
  inactive:  "#fef2f2",
};

const ALERT_COLOR: Record<string, string> = {
  critical: "#dc2626",
  warning:  "#d97706",
  info:     "#16a34a",
};

// ── Stat card ──────────────────────────────────────────
function StatCard({ value, label, color, bg }: { value: string; label: string; color: string; bg: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderTop: `3px solid ${color}`,
      borderRadius: 8,
      padding: "16px 20px",
      flex: 1,
      minWidth: 120,
    }}>
      <div style={{ fontSize: 28, fontWeight: 900, color, fontFamily: "'Times New Roman', serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 700, marginTop: 5, letterSpacing: 0.3 }}>{label.toUpperCase()}</div>
    </div>
  );
}

// ── Per-student analytics (Garmin-style) ──────────────
interface Badge { key: string; label: string; earned: boolean }
interface StudentAnalytics {
  streak:          number;          // consecutive days
  weeklyMins:      number[];        // [Mon, Tue, Wed, Thu, Fri]
  masteryHistory:  number[];        // last 7 sessions
  accuracy:        number;          // % correct answers
  sessionsThisWeek: number;
  personalBest:    number;          // highest mastery ever recorded
  badges:          Badge[];
}

function makeBadges(streak: number, mastery: number, pb: number, extra: string[] = []): Badge[] {
  return [
    { key: "streak5",   label: "5-Day Streak",  earned: streak >= 5  },
    { key: "streak14",  label: "2-Week Streak",  earned: streak >= 14 },
    { key: "mastery80", label: "80% Mastery",    earned: pb >= 80     },
    { key: "mastery90", label: "Top Performer",  earned: pb >= 90     },
    { key: "speedster", label: "Speed Reader",   earned: extra.includes("speed") },
    { key: "story",     label: "Story Lover",    earned: extra.includes("story") },
    { key: "pb",        label: "Personal Best",  earned: mastery >= pb && pb > 0 },
    { key: "consistent",label: "Consistent",     earned: streak >= 7  },
  ];
}

const STUDENT_ANALYTICS: Record<string, StudentAnalytics> = {
  Kila:  { streak: 12, weeklyMins: [12,15,11,14,12], masteryHistory: [79,81,83,85,86,87,87], accuracy: 94, sessionsThisWeek: 5, personalBest: 87, badges: makeBadges(12, 87, 87, ["speed"]) },
  Beni:  { streak:  8, weeklyMins: [18,20,15,18,18], masteryHistory: [30,33,35,34,33,34,34], accuracy: 61, sessionsThisWeek: 5, personalBest: 35, badges: makeBadges(8, 34, 35) },
  Meri:  { streak: 14, weeklyMins: [14,16,15,13,15], masteryHistory: [58,60,61,63,64,65,65], accuracy: 82, sessionsThisWeek: 5, personalBest: 65, badges: makeBadges(14, 65, 65, ["story"]) },
  Tama:  { streak:  9, weeklyMins: [13,15,14,14,14], masteryHistory: [65,67,69,70,71,71,71], accuracy: 88, sessionsThisWeek: 5, personalBest: 71, badges: makeBadges(9, 71, 71) },
  Saina: { streak:  7, weeklyMins: [15,17,16,16,16], masteryHistory: [60,62,64,66,67,68,68], accuracy: 85, sessionsThisWeek: 5, personalBest: 68, badges: makeBadges(7, 68, 68) },
  Peni:  { streak:  0, weeklyMins: [0, 0, 0, 0, 0],  masteryHistory: [19,20,20,20,20,20,20], accuracy: 55, sessionsThisWeek: 0, personalBest: 22, badges: makeBadges(0, 20, 22) },
  Hera:  { streak: 18, weeklyMins: [10,11,10, 9,10], masteryHistory: [86,87,88,89,90,91,91], accuracy: 97, sessionsThisWeek: 5, personalBest: 91, badges: makeBadges(18, 91, 91, ["speed", "story"]) },
  Walo:  { streak:  6, weeklyMins: [20,22,19,21,20], masteryHistory: [44,43,42,41,41,41,41], accuracy: 63, sessionsThisWeek: 5, personalBest: 46, badges: makeBadges(6, 41, 46) },
  Karo:  { streak: 11, weeklyMins: [13,14,13,12,13], masteryHistory: [69,70,71,72,73,73,73], accuracy: 87, sessionsThisWeek: 5, personalBest: 73, badges: makeBadges(11, 73, 73, ["story"]) },
  Naomi: { streak:  8, weeklyMins: [16,18,17,16,17], masteryHistory: [55,57,58,59,60,60,60], accuracy: 79, sessionsThisWeek: 5, personalBest: 60, badges: makeBadges(8, 60, 60) },
  Soki:  { streak: 15, weeklyMins: [11,12,10,11,11], masteryHistory: [78,80,81,83,84,84,84], accuracy: 92, sessionsThisWeek: 5, personalBest: 84, badges: makeBadges(15, 84, 84, ["speed"]) },
  Waina: { streak:  5, weeklyMins: [22,23,21,22,22], masteryHistory: [36,37,37,38,38,38,38], accuracy: 58, sessionsThisWeek: 5, personalBest: 40, badges: makeBadges(5, 38, 40) },
  John:  { streak:  7, weeklyMins: [15,14,15,15,15], masteryHistory: [49,51,53,54,55,55,55], accuracy: 74, sessionsThisWeek: 5, personalBest: 55, badges: makeBadges(7, 55, 55) },
  Rosa:  { streak:  9, weeklyMins: [14,15,13,14,14], masteryHistory: [56,58,60,61,62,62,62], accuracy: 88, sessionsThisWeek: 5, personalBest: 62, badges: makeBadges(9, 62, 62) },
  Peter: { streak:  0, weeklyMins: [0, 0, 0, 0, 0],  masteryHistory: [13,14,14,15,15,15,15], accuracy: 48, sessionsThisWeek: 0, personalBest: 18, badges: makeBadges(0, 15, 18) },
  Mary:  { streak: 13, weeklyMins: [15,17,16,15,16], masteryHistory: [63,65,67,68,69,70,70], accuracy: 86, sessionsThisWeek: 5, personalBest: 70, badges: makeBadges(13, 70, 70, ["story"]) },
  James: { streak: 16, weeklyMins: [ 9,10, 9, 8, 9], masteryHistory: [84,85,87,88,89,89,89], accuracy: 96, sessionsThisWeek: 5, personalBest: 89, badges: makeBadges(16, 89, 89, ["speed"]) },
  Grace: { streak: 10, weeklyMins: [15,14,15,14,15], masteryHistory: [58,60,61,62,63,64,64], accuracy: 84, sessionsThisWeek: 5, personalBest: 64, badges: makeBadges(10, 64, 64) },
};

// ── Analytics visual components ────────────────────────

const DAYS = ["M", "T", "W", "T", "F"];

function WeeklyActivityChart({ mins }: { mins: number[] }) {
  const max = Math.max(...mins, 1);
  const totalMins = mins.reduce((a, b) => a + b, 0);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 52 }}>
        {mins.map((m, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: m > 0 ? "#1a2e4a" : "#d1d5db" }}>
              {m > 0 ? `${m}m` : "—"}
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: (m / max) * 34 }}
              transition={{ duration: 0.5, delay: i * 0.07, ease: "easeOut" }}
              style={{
                width: "100%",
                background: m === 0 ? "#e5e7eb" : m === Math.max(...mins) ? "linear-gradient(180deg,#F5A623,#E84D2A)" : "linear-gradient(180deg,#3b82f6,#1a2e4a)",
                borderRadius: "3px 3px 0 0",
                minHeight: m > 0 ? 4 : 2,
              }}
            />
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af" }}>{DAYS[i]}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, marginTop: 6, textAlign: "right" }}>
        {totalMins}m total this week
      </div>
    </div>
  );
}

function MasterySparkline({ history, color }: { history: number[]; color: string }) {
  const W = 200, H = 44, pad = 4;
  const min = Math.min(...history) - 5;
  const max = Math.max(...history) + 5;
  const pts = history.map((v, i) => {
    const x = pad + (i / (history.length - 1)) * (W - pad * 2);
    const y = H - pad - ((v - min) / (max - min)) * (H - pad * 2);
    return `${x},${y}`;
  }).join(" ");
  const lastX = pad + (W - pad * 2);
  const lastY = H - pad - ((history[history.length - 1] - min) / (max - min)) * (H - pad * 2);
  const trend = history[history.length - 1] - history[0];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700 }}>7-Session Trend</span>
        <span style={{
          fontSize: 10, fontWeight: 900,
          color: trend > 0 ? "#16a34a" : trend < 0 ? "#dc2626" : "#6b7280",
        }}>
          {trend > 0 ? `▲ +${trend}%` : trend < 0 ? `▼ ${trend}%` : "▬ Stable"}
        </span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Fill area */}
        <polygon
          points={`${pad},${H} ${pts} ${lastX},${H}`}
          fill={`url(#spark-${color.replace("#","")})`}
        />
        {/* Line */}
        <polyline
          points={pts}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Last dot */}
        <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
      </svg>
    </div>
  );
}

// Badge SVG icons — each accepts a `color` prop
const BadgeSvgFlame = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2c0 0-5 5.5-5 10a5 5 0 0010 0c0-2.5-1.5-4.5-2.5-6 0 2-1 3.5-2.5 4 1-2 0-5-1.5-6.5C10.5 5 12 2 12 2z"/>
    <path d="M12 14c0 1.1-.9 2-2 2s-2-.9-2-2c0-1.5 2-4 2-4s2 2.5 2 4z" fill="white" opacity="0.6"/>
  </svg>
);
const BadgeSvgBurst = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
    <path d="M12 2l1.5 4.6H18l-3.9 2.8 1.5 4.6L12 11l-3.9 2.8L9.6 9.4 5.7 6.6h4.8z" fill="white" opacity="0.5"/>
  </svg>
);
const BadgeSvgStar = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>
);
const BadgeSvgTrophy = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4a2 2 0 01-2-2V5h4"/><path d="M18 9h2a2 2 0 002-2V5h-4"/>
    <path d="M6 3h12v6a6 6 0 01-12 0V3z"/><path d="M9 21h6"/><path d="M12 15v6"/>
    <path d="M8 21h8"/>
  </svg>
);
const BadgeSvgLightning = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={color}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const BadgeSvgBook = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
  </svg>
);
const BadgeSvgTarget = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const BadgeSvgCalendar = ({ color }: { color: string }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    <line x1="8" y1="14" x2="8.01" y2="14" strokeWidth="3"/><line x1="12" y1="14" x2="12.01" y2="14" strokeWidth="3"/>
    <line x1="16" y1="14" x2="16.01" y2="14" strokeWidth="3"/>
  </svg>
);

const BADGE_SVG_MAP: Record<string, { Icon: React.FC<{ color: string }>; earnedColor: string; bg: string; border: string }> = {
  streak5:    { Icon: BadgeSvgFlame,    earnedColor: "#E84D2A", bg: "#fff7ed", border: "#fed7aa" },
  streak14:   { Icon: BadgeSvgBurst,    earnedColor: "#7c3aed", bg: "#faf5ff", border: "#ddd6fe" },
  mastery80:  { Icon: BadgeSvgStar,     earnedColor: "#F5A623", bg: "#fffbeb", border: "#fde68a" },
  mastery90:  { Icon: BadgeSvgTrophy,   earnedColor: "#d97706", bg: "#fff7ed", border: "#fcd34d" },
  speedster:  { Icon: BadgeSvgLightning,earnedColor: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  story:      { Icon: BadgeSvgBook,     earnedColor: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" },
  pb:         { Icon: BadgeSvgTarget,   earnedColor: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  consistent: { Icon: BadgeSvgCalendar, earnedColor: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
};

function BadgeChip({ badge }: { badge: Badge }) {
  const def = BADGE_SVG_MAP[badge.key];
  if (!def) return null;
  const { Icon, earnedColor, bg, border } = def;
  const color = badge.earned ? earnedColor : "#d1d5db";
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 10px", borderRadius: 50,
      background: badge.earned ? bg : "#f9fafb",
      border: `1px solid ${badge.earned ? border : "#e5e7eb"}`,
      opacity: badge.earned ? 1 : 0.5,
    }}>
      <Icon color={color} />
      <span style={{ fontSize: 10, fontWeight: 800, color: badge.earned ? earnedColor : "#9ca3af", letterSpacing: 0.2 }}>
        {badge.label}
      </span>
    </div>
  );
}

// ── Student row type (inferred from data) ──────────────
type StudentRow = (typeof CLASS_STUDENTS)[0];

// ── SVG icons for drawer ───────────────────────────────
const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconFocus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);
const IconLightbulb = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/>
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0018 8 6 6 0 006 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 018.91 14"/>
  </svg>
);

// ── Student feedback drawer ────────────────────────────

function StudentDrawer({ student, onClose }: { student: StudentRow; onClose: () => void }) {
  const fb = STUDENT_FEEDBACK[student.name];
  const color  = STATUS_COLOR[student.status] ?? "#2563eb";
  const bg     = STATUS_BG[student.status]    ?? "#eff6ff";
  const initials = student.name.charAt(0);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.25)",
          zIndex: 100,
        }}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: 480 }}
        animate={{ x: 0 }}
        exit={{ x: 480 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        style={{
          position: "fixed", top: 0, right: 0, bottom: 0,
          width: 460,
          background: "#fff",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.12)",
          zIndex: 101,
          display: "flex",
          flexDirection: "column",
          fontFamily: "'Times New Roman', serif",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div style={{
          background: "#1a2e4a",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            background: bg, border: `2px solid ${color}60`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, fontWeight: 900, color,
            fontFamily: "'Times New Roman', serif", flexShrink: 0,
          }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: "#fff", fontFamily: "'Times New Roman', serif" }}>
              {student.name}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                background: `${color}25`, borderRadius: 4, padding: "2px 8px",
                fontSize: 10, fontWeight: 800, color,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
                {STATUS_LABEL[student.status]}
              </span>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 700 }}>
                Grade {student.grade} · {student.mastery}% mastery · {student.skill}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.1)", border: "none",
              borderRadius: 6, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.7)", fontSize: 18, lineHeight: 1,
            }}
          >×</button>
        </div>

        {/* Mastery bar */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 900, color: "#9ca3af", letterSpacing: 0.6, textTransform: "uppercase" }}>Mastery Progress</span>
            <span style={{ fontSize: 11, fontWeight: 900, color }}>{student.mastery}%</span>
          </div>
          <div style={{ height: 8, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${student.mastery}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{ height: "100%", background: `linear-gradient(90deg, ${color}99, ${color})`, borderRadius: 4 }}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Time active today: {student.time}</span>
            <span style={{ fontSize: 10, color: "#9ca3af" }}>Topic: {student.skill}</span>
          </div>
        </div>

        {/* ── Analytics section ── */}
        {(() => {
          const an = STUDENT_ANALYTICS[student.name];
          if (!an) return null;
          const acColor = an.accuracy >= 85 ? "#16a34a" : an.accuracy >= 65 ? "#2563eb" : "#d97706";
          const earnedBadges = an.badges.filter(b => b.earned);
          return (
            <div style={{ padding: "0 24px 4px", display: "flex", flexDirection: "column", gap: 14 }}>

              {/* Stat pills row */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                {[
                  { label: "Streak",    value: an.streak > 0 ? `${an.streak}d 🔥` : "0d", color: an.streak >= 7 ? "#E84D2A" : "#6b7280" },
                  { label: "Accuracy",  value: `${an.accuracy}%`,          color: acColor },
                  { label: "Sessions",  value: `${an.sessionsThisWeek}/5`,  color: "#2563eb" },
                  { label: "Best",      value: `${an.personalBest}%`,       color: "#7c3aed" },
                ].map(s => (
                  <div key={s.label} style={{
                    background: "#f9fafb", border: "1px solid #e5e7eb",
                    borderRadius: 8, padding: "10px 8px", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: s.color, fontFamily: "'Times New Roman', serif", lineHeight: 1 }}>
                      {s.value}
                    </div>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#9ca3af", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {/* Weekly activity */}
                <div style={{
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  borderRadius: 8, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Weekly Activity
                  </div>
                  <WeeklyActivityChart mins={an.weeklyMins} />
                </div>

                {/* Mastery sparkline */}
                <div style={{
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  borderRadius: 8, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#374151", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Mastery Trend
                  </div>
                  <MasterySparkline history={an.masteryHistory} color={color} />
                </div>
              </div>

              {/* Badges */}
              {earnedBadges.length > 0 && (
                <div style={{
                  background: "#f9fafb", border: "1px solid #e5e7eb",
                  borderRadius: 8, padding: "10px 12px",
                }}>
                  <div style={{ fontSize: 10, fontWeight: 900, color: "#374151", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                    Achievements  <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", textTransform: "none", letterSpacing: 0 }}>({earnedBadges.length} earned)</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {an.badges.map(b => <BadgeChip key={b.key} badge={b} />)}
                  </div>
                </div>
              )}

            </div>
          );
        })()}

        {/* AI badge */}
        <div style={{ padding: "14px 24px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: "linear-gradient(135deg, #1a2e4a, #2563eb)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}><IconBrain /></div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 900, color: "#111827" }}>AI Student Feedback</div>
              <div style={{ fontSize: 10, color: "#9ca3af" }}>Based on session data · Generated today</div>
            </div>
            <div style={{
              marginLeft: "auto", fontSize: 9, fontWeight: 800,
              background: "#eff6ff", border: "1px solid #bfdbfe",
              borderRadius: 50, padding: "2px 8px", color: "#2563eb",
            }}>AI INSIGHT</div>
          </div>

          {/* Summary */}
          {fb && (
            <p style={{
              margin: "0 0 16px", fontSize: 12.5, color: "#374151",
              lineHeight: 1.75, fontWeight: 600,
              background: "#f9fafb", borderRadius: 8,
              padding: "12px 14px", border: "1px solid #e5e7eb",
            }}>{fb.summary}</p>
          )}
        </div>

        {/* Sections */}
        {fb && (
          <div style={{ padding: "0 24px 24px", display: "flex", flexDirection: "column", gap: 12 }}>

            {/* Strengths */}
            <div style={{
              border: "1px solid #bbf7d0", borderRadius: 8,
              background: "#f0fdf4", overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderBottom: "1px solid #bbf7d0",
              }}>
                <span style={{ color: "#16a34a", display: "flex" }}><IconCheck /></span>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#16a34a", letterSpacing: 0.4 }}>STRENGTHS</span>
              </div>
              <ul style={{ margin: 0, padding: "10px 14px 10px 28px", display: "flex", flexDirection: "column", gap: 6 }}>
                {fb.strengths.map((s, i) => (
                  <li key={i} style={{ fontSize: 12, color: "#166534", lineHeight: 1.55, fontWeight: 600 }}>{s}</li>
                ))}
              </ul>
            </div>

            {/* Focus area */}
            <div style={{
              border: "1px solid #fed7aa", borderRadius: 8,
              background: "#fff7ed", overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderBottom: "1px solid #fed7aa",
              }}>
                <span style={{ color: "#d97706", display: "flex" }}><IconFocus /></span>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#d97706", letterSpacing: 0.4 }}>FOCUS AREA</span>
                <span style={{
                  marginLeft: "auto", fontSize: 10, fontWeight: 800,
                  background: "#fef3c7", border: "1px solid #fde68a",
                  borderRadius: 50, padding: "1px 8px", color: "#92400e",
                }}>{fb.focusArea.concept}</span>
              </div>
              <p style={{ margin: 0, padding: "10px 14px", fontSize: 12, color: "#92400e", lineHeight: 1.65, fontWeight: 600 }}>
                {fb.focusArea.detail}
              </p>
            </div>

            {/* Recommendation */}
            <div style={{
              border: "1px solid #bfdbfe", borderRadius: 8,
              background: "#eff6ff", overflow: "hidden",
            }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "10px 14px", borderBottom: "1px solid #bfdbfe",
              }}>
                <span style={{ color: "#2563eb", display: "flex" }}><IconLightbulb /></span>
                <span style={{ fontSize: 11, fontWeight: 900, color: "#2563eb", letterSpacing: 0.4 }}>RECOMMENDED ACTION</span>
              </div>
              <p style={{ margin: 0, padding: "10px 14px", fontSize: 12, color: "#1e40af", lineHeight: 1.65, fontWeight: 600 }}>
                {fb.recommendation}
              </p>
            </div>

          </div>
        )}
      </motion.div>
    </>
  );
}

// ── Main component ─────────────────────────────────────
interface Props {
  lang: "tok" | "en";
  onSwitchToGovt?: () => void;
}

export default function TeacherDashboard({ lang, onSwitchToGovt }: Props) {
  const [filter, setFilter]         = useState<FilterStatus>("all");
  const [alerts, setAlerts]         = useState<Alert[]>(INITIAL_ALERTS);
  const [search, setSearch]         = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRow | null>(null);

  // Unlock scroll — App.css sets body { overflow: hidden } for the student app
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const dismissAlert = (id: number) =>
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a));

  const visibleAlerts = alerts.filter(a => !a.dismissed);

  const filtered = CLASS_STUDENTS.filter(s => {
    const matchFilter = filter === "all" || s.status === filter;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const stats = {
    total:     CLASS_STUDENTS.length,
    excelling: CLASS_STUDENTS.filter(s => s.status === "flying").length,
    atRisk:    CLASS_STUDENTS.filter(s => s.status === "attention").length,
    absent:    CLASS_STUDENTS.filter(s => s.status === "inactive").length,
    avgMastery: Math.round(CLASS_STUDENTS.reduce((sum, s) => sum + s.mastery, 0) / CLASS_STUDENTS.length),
  };

  const filters: { key: FilterStatus; label: string }[] = [
    { key: "all",       label: "All Students"  },
    { key: "flying",    label: "Excelling"     },
    { key: "on-track",  label: "Progressing"   },
    { key: "attention", label: "At Risk"        },
    { key: "inactive",  label: "Absent"         },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f3f4f6",
      fontFamily: "'Times New Roman', serif",
      color: "#111827",
      display: "flex",
      flexDirection: "column",
    }}>

      {/* ── Top nav bar ── */}
      <div style={{
        background: "#1a2e4a",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        height: 56,
        flexShrink: 0,
      }}>
        {/* Left: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              background: "#fff",
              borderRadius: 8,
              padding: "2px 8px",
              display: "flex",
              alignItems: "center",
              boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
            }}>
              <img
                src="/New-Logo.png"
                alt="Stori Bilong Yu"
                style={{ height: 40, width: "auto", objectFit: "contain", display: "block" }}
              />
            </div>
            <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.12)" }} />
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600 }}>
              Teacher Portal
            </div>
          </div>

          {/* Nav links */}
          <div style={{ display: "flex", gap: 2, marginLeft: 16 }}>
            {["Dashboard", "Reports", "Resources", "Support"].map((item, i) => (
              <div
                key={item}
                style={{
                  padding: "0 14px",
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: i === 0 ? "#F5A623" : "rgba(255,255,255,0.55)",
                  borderBottom: i === 0 ? "2px solid #F5A623" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Right: teacher info + live */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <motion.div
              style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ repeat: Infinity, duration: 1.6 }}
            />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#4ade80" }}>Live</span>
          </div>
          <div style={{ width: 1, height: 24, background: "rgba(255,255,255,0.12)" }} />
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>{TEACHER.name}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)" }}>
              {TEACHER.school} · Grade {TEACHER.grade}
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "#F5A623",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: "#1a2e4a",
          }}>
            K
          </div>
          {onSwitchToGovt && (
            <button
              onClick={onSwitchToGovt}
              style={{
                background: "rgba(245,166,35,0.15)",
                border: "1px solid rgba(245,166,35,0.4)",
                borderRadius: 6, padding: "5px 12px",
                color: "#F5A623", fontSize: 11, fontWeight: 800,
                cursor: "pointer", fontFamily: "'Times New Roman', serif",
              }}
            >
              Govt View →
            </button>
          )}
        </div>
      </div>

      {/* ── Page header ── */}
      <div style={{
        background: "#fff",
        borderBottom: "1px solid #e5e7eb",
        padding: "16px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 900, color: "#111827", fontFamily: "'Times New Roman', serif" }}>
            Class Overview — Grade {TEACHER.grade}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{today}</div>
        </div>
        <button style={{
          background: "#1a2e4a", color: "#fff",
          border: "none", borderRadius: 7,
          padding: "8px 18px", fontSize: 12, fontWeight: 800,
          cursor: "pointer", fontFamily: "'Times New Roman', serif",
        }}>
          + Export Report
        </button>
      </div>

      {/* ── Stat row ── */}
      <div style={{ display: "flex", gap: 14, padding: "20px 28px 0", flexWrap: "wrap" }}>
        <StatCard value={String(stats.total)}      label="Total Students"    color="#1a2e4a" bg="#f0f4ff" />
        <StatCard value={String(stats.excelling)}  label="Excelling"         color="#16a34a" bg="#f0fdf4" />
        <StatCard value={String(CLASS_STUDENTS.filter(s => s.status === "on-track").length)} label="Progressing" color="#2563eb" bg="#eff6ff" />
        <StatCard value={String(stats.atRisk)}     label="At Risk"           color="#d97706" bg="#fffbeb" />
        <StatCard value={String(stats.absent)}     label="Absent"            color="#dc2626" bg="#fef2f2" />
        <StatCard value={`${stats.avgMastery}%`}   label="Avg Mastery"       color="#7c3aed" bg="#faf5ff" />
      </div>

      {/* ── AI Insights panel ── */}
      <div style={{ margin: "20px 28px 0", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 20px", borderBottom: "1px solid #f3f4f6",
          background: "#fafafa",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #1a2e4a, #2563eb)",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}><IconBrain /></div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 900, color: "#111827" }}>AI Class Feedback</div>
            <div style={{ fontSize: 11, color: "#9ca3af" }}>Generated from session data · Updated today at 8:42 AM</div>
          </div>
          <div style={{
            marginLeft: "auto", fontSize: 10, fontWeight: 800,
            background: "#eff6ff", border: "1px solid #bfdbfe",
            borderRadius: 50, padding: "3px 10px", color: "#2563eb",
          }}>
            AI INSIGHT
          </div>
        </div>

        {/* Summary paragraph */}
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #f3f4f6" }}>
          <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.7, fontWeight: 600 }}>
            {AI_INSIGHTS.summary}
          </p>
        </div>

        {/* Observation cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {AI_INSIGHTS.observations.map((obs, i) => (
            <div
              key={i}
              style={{
                padding: "16px 20px",
                borderRight: i < 3 ? "1px solid #f3f4f6" : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: obs.bg, border: `1px solid ${obs.color}25`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <obs.Icon />
                </div>
                <span style={{ fontSize: 11, fontWeight: 900, color: obs.color, letterSpacing: 0.3 }}>
                  {obs.label.toUpperCase()}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "#6b7280", lineHeight: 1.6 }}>
                {obs.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ display: "flex", flex: 1, gap: 16, padding: 28, alignItems: "flex-start" }}>

        {/* ── Student table panel ── */}
        <div style={{
          flex: 1,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "14px 20px",
            borderBottom: "1px solid #f3f4f6",
            flexWrap: "wrap",
            background: "#fafafa",
          }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search student..."
              style={{
                background: "#fff", border: "1px solid #e5e7eb",
                borderRadius: 6, padding: "7px 14px", color: "#111827",
                fontSize: 12, fontFamily: "'Times New Roman', serif",
                outline: "none", width: 180,
              }}
            />
            <div style={{ display: "flex", gap: 4 }}>
              {filters.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  style={{
                    background: filter === f.key ? "#1a2e4a" : "#fff",
                    border: "1px solid",
                    borderColor: filter === f.key ? "#1a2e4a" : "#e5e7eb",
                    borderRadius: 6, padding: "5px 12px",
                    color: filter === f.key ? "#fff" : "#6b7280",
                    fontSize: 11, fontWeight: 800, cursor: "pointer",
                    transition: "all 0.15s", fontFamily: "'Times New Roman', serif",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div style={{ marginLeft: "auto", fontSize: 11, color: "#9ca3af", fontWeight: 700 }}>
              {filtered.length} of {CLASS_STUDENTS.length} students
            </div>
          </div>

          {/* Table */}
          <div style={{ overflow: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                  {["Student", "Status", "Current Topic", "Mastery", "Time Active", "Action"].map(h => (
                    <th key={h} style={{
                      textAlign: "left", padding: "10px 16px",
                      fontSize: 10, fontWeight: 900, letterSpacing: 0.8,
                      color: "#9ca3af", textTransform: "uppercase",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <motion.tbody
                key={filter + search}
                initial="hidden"
                animate="show"
                variants={{ hidden: {}, show: { transition: { staggerChildren: 0.03 } } }}
              >
                {filtered.map((s, i) => {
                  const color = STATUS_COLOR[s.status] ?? "#2563eb";
                  const bg    = STATUS_BG[s.status]    ?? "#eff6ff";
                  return (
                    <motion.tr
                      key={s.name}
                      variants={{ hidden: { opacity: 0, y: 6 }, show: { opacity: 1, y: 0 } }}
                      style={{ borderBottom: "1px solid #f3f4f6", cursor: "pointer" }}
                      onClick={() => setSelectedStudent(s)}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f4ff"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {/* Name */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: bg, border: `1.5px solid ${color}40`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 13, fontWeight: 900, color,
                            fontFamily: "'Times New Roman', serif", flexShrink: 0,
                          }}>
                            {s.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: "#111827" }}>{s.name}</div>
                            <div style={{ fontSize: 10, color: "#9ca3af" }}>Grade {s.grade}</div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{
                          display: "inline-flex", alignItems: "center", gap: 5,
                          background: bg, borderRadius: 4,
                          padding: "3px 9px",
                          fontSize: 11, fontWeight: 800, color,
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, display: "inline-block" }} />
                          {STATUS_LABEL[s.status]}
                        </span>
                      </td>

                      {/* Skill */}
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151", fontWeight: 700 }}>
                        {s.skill}
                      </td>

                      {/* Mastery bar */}
                      <td style={{ padding: "12px 16px", minWidth: 150 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            flex: 1, height: 6, background: "#e5e7eb",
                            borderRadius: 3, overflow: "hidden",
                          }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${s.mastery}%` }}
                              transition={{ duration: 0.6, delay: i * 0.02 }}
                              style={{ height: "100%", background: color, borderRadius: 3 }}
                            />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 900, color, minWidth: 32, textAlign: "right" }}>
                            {s.mastery}%
                          </span>
                        </div>
                      </td>

                      {/* Time */}
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
                        {s.time}
                      </td>

                      {/* Action */}
                      <td style={{ padding: "12px 16px" }}>
                        {(s.status === "attention" || s.status === "inactive") ? (
                          <button style={{
                            background: "#fff", border: `1px solid ${color}`,
                            borderRadius: 6, padding: "4px 12px", color,
                            fontSize: 11, fontWeight: 800, cursor: "pointer",
                            fontFamily: "'Times New Roman', serif",
                          }}>
                            {s.status === "inactive" ? "Contact" : "Support"}
                          </button>
                        ) : (
                          <button style={{
                            background: "#fff", border: "1px solid #e5e7eb",
                            borderRadius: 6, padding: "4px 12px", color: "#9ca3af",
                            fontSize: 11, fontWeight: 800, cursor: "pointer",
                            fontFamily: "'Times New Roman', serif",
                          }}>
                            View
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </motion.tbody>
            </table>
          </div>
        </div>

        {/* ── AI Alerts panel ── */}
        <div style={{
          width: 290,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 10,
          overflow: "hidden",
          flexShrink: 0,
        }}>
          {/* Panel header */}
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid #f3f4f6",
            background: "#fafafa",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: "#374151", textTransform: "uppercase", letterSpacing: 0.8 }}>
              System Alerts
            </div>
            {visibleAlerts.length > 0 && (
              <span style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: 50, padding: "1px 8px",
                fontSize: 10, fontWeight: 900, color: "#dc2626",
              }}>
                {visibleAlerts.length}
              </span>
            )}
          </div>

          {/* Alert list */}
          <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <AnimatePresence>
              {visibleAlerts.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "32px 16px",
                  color: "#9ca3af", fontSize: 12, fontWeight: 700,
                }}>
                  No active alerts
                </div>
              ) : visibleAlerts.map(a => {
                const color = ALERT_COLOR[a.type];
                return (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10, height: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{
                      background: "#fff",
                      border: "1px solid #e5e7eb",
                      borderLeft: `3px solid ${color}`,
                      borderRadius: 7,
                      padding: "12px 14px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", marginBottom: 2 }}>
                        {a.student}
                      </div>
                      <button
                        onClick={() => dismissAlert(a.id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#d1d5db", fontSize: 16, lineHeight: 1, padding: "0 2px",
                        }}
                      >×</button>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 900, color: "#111827", marginBottom: 6 }}>
                      {a.title}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.5, marginBottom: 10 }}>
                      {a.body}
                    </div>
                    <button style={{
                      background: "#f9fafb", border: `1px solid ${color}40`,
                      borderRadius: 5, padding: "4px 10px", color,
                      fontSize: 10, fontWeight: 900, cursor: "pointer",
                      fontFamily: "'Times New Roman', serif",
                    }}>
                      {a.action} →
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Student detail drawer ── */}
      <AnimatePresence>
        {selectedStudent && (
          <StudentDrawer
            student={selectedStudent}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
