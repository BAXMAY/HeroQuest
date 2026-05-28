/**
 * Demo-mode stubs — used when no real Anthropic API key is available.
 * Active when `env.ANTHROPIC_API_KEY` is unset, empty, or starts with "demo".
 *
 * Lets the app boot end-to-end on `pnpm demo` without needing a key or a
 * paid Anthropic account, so contributors can take screenshots, write
 * tests, and try the flow before signing up.
 *
 * Real prod still uses the live Claude calls in evaluate-quest.ts etc.
 */
import type { Locale } from "@heroquest/db/types";
import type { AnthropicEnv } from "./client";
import type { QuestEvaluation } from "./evaluate-quest";
import type { TriviaItem } from "./generate-trivia";
import type { Opportunity } from "./suggest-opportunities";

export function isDemoMode(env: AnthropicEnv): boolean {
  const key = env.ANTHROPIC_API_KEY?.trim() ?? "";
  return key === "" || key.startsWith("demo");
}

// ---- Quest evaluation ----

const DEMO_EVAL_BUCKETS: ReadonlyArray<QuestEvaluation> = [
  { xp: 30, coins: 3, justification: "Nice little deed — keep it up!" },
  { xp: 50, coins: 5, justification: "Solid effort — a fair reward." },
  { xp: 75, coins: 8, justification: "Real thought went into this one." },
  { xp: 110, coins: 11, justification: "Took meaningful effort, well done!" },
  { xp: 150, coins: 15, justification: "Outstanding deed with real impact." },
];

export function stubEvaluateQuest(description: string): QuestEvaluation {
  // Deterministic so screenshots are stable — hash the description length
  // into a bucket so different demo deeds get different rewards.
  const idx = Math.min(
    DEMO_EVAL_BUCKETS.length - 1,
    Math.floor((description.length % 100) / 20),
  );
  return DEMO_EVAL_BUCKETS[idx]!;
}

// ---- Trivia ----

const DEMO_TRIVIA_EN: TriviaItem[] = [
  {
    question: "What's the kindest way to react when a friend wins a prize you wanted?",
    options: ["Tell them they didn't deserve it", "Congratulate them sincerely", "Walk away", "Ask for half"],
    correctIndex: 1,
    explanation: "Being happy for friends' wins makes everyone feel good.",
    difficulty: "easy",
    topic: "kindness",
  },
  {
    question: "You see litter in the park. What's the best thing to do?",
    options: ["Ignore it", "Take a photo", "Pick it up and bin it", "Blame someone"],
    correctIndex: 2,
    explanation: "Even small clean-ups help everyone enjoy the park.",
    difficulty: "easy",
    topic: "environment",
  },
  {
    question: "A classmate forgot their lunch. What helps most?",
    options: ["Laugh about it", "Tell the teacher loudly", "Share some of yours", "Ignore"],
    correctIndex: 2,
    explanation: "Sharing food when you can is a small act of big kindness.",
    difficulty: "easy",
    topic: "sharing",
  },
  {
    question: "Your dog hasn't been walked yet today. The grown-ups are busy. What's helpful?",
    options: ["Wait for someone else", "Offer to walk them safely", "Hide", "Complain"],
    correctIndex: 1,
    explanation: "Helping look after pets is part of being a good companion.",
    difficulty: "medium",
    topic: "animals",
  },
  {
    question: "You broke a vase by accident. What's the honest move?",
    options: ["Hide the pieces", "Blame the cat", "Tell an adult", "Pretend you didn't see"],
    correctIndex: 2,
    explanation: "Honesty when something goes wrong builds trust.",
    difficulty: "medium",
    topic: "honesty",
  },
];

const DEMO_TRIVIA_TH: TriviaItem[] = [
  {
    question: "เพื่อนได้รางวัลที่เราอยากได้ ควรทำอย่างไรดีที่สุด?",
    options: ["บอกว่าไม่สมควรได้", "ยินดีกับเพื่อนจริงใจ", "เดินหนี", "ขอแบ่งครึ่ง"],
    correctIndex: 1,
    explanation: "การยินดีกับเพื่อนทำให้ทุกคนรู้สึกดี",
    difficulty: "easy",
    topic: "kindness",
  },
  {
    question: "เจอขยะในสวนสาธารณะ ควรทำยังไง?",
    options: ["ปล่อยไว้", "ถ่ายรูป", "เก็บใส่ถังขยะ", "โทษคนอื่น"],
    correctIndex: 2,
    explanation: "การเก็บขยะเล็ก ๆ ช่วยให้ทุกคนใช้สวนได้ดีขึ้น",
    difficulty: "easy",
    topic: "environment",
  },
  {
    question: "เพื่อนลืมข้าวมาโรงเรียน เราควรทำอย่างไร?",
    options: ["หัวเราะ", "บอกครูเสียงดัง", "แบ่งข้าวให้", "เฉย ๆ"],
    correctIndex: 2,
    explanation: "การแบ่งปันเมื่อทำได้คือความเมตตา",
    difficulty: "easy",
    topic: "sharing",
  },
  {
    question: "ทำของแตกโดยไม่ตั้งใจ ควรทำยังไง?",
    options: ["ซ่อนเศษไว้", "โทษแมว", "บอกผู้ใหญ่", "ทำเป็นไม่รู้"],
    correctIndex: 2,
    explanation: "ความซื่อสัตย์สร้างความเชื่อใจ",
    difficulty: "medium",
    topic: "honesty",
  },
  {
    question: "หมาในบ้านยังไม่ได้เดินเล่น ผู้ใหญ่ยุ่ง ควรทำยังไง?",
    options: ["รอคนอื่น", "อาสาพาไปเดิน", "ซ่อนตัว", "บ่น"],
    correctIndex: 1,
    explanation: "ช่วยดูแลสัตว์เลี้ยงคือหน้าที่ของเพื่อนที่ดี",
    difficulty: "medium",
    topic: "animals",
  },
];

export function stubGenerateTrivia(locale: Locale, count: number): TriviaItem[] {
  const source = locale === "th" ? DEMO_TRIVIA_TH : DEMO_TRIVIA_EN;
  return source.slice(0, Math.max(1, Math.min(count, source.length)));
}

// ---- Opportunities ----

const DEMO_OPPS_EN: Opportunity[] = [
  { title: "Help wash the dishes", description: "Take charge of dish duty after dinner — wash, dry, and put away.", category: "family" },
  { title: "Feed the birds", description: "Scatter a small handful of birdseed in the garden and watch who visits.", category: "animals" },
  { title: "Pick up 5 pieces of litter", description: "Take a bag on your next walk and collect any litter you see.", category: "environment" },
  { title: "Read a story to a younger sibling", description: "Pick a favourite book and read aloud for 10 minutes.", category: "education" },
];

const DEMO_OPPS_TH: Opportunity[] = [
  { title: "ช่วยล้างจาน", description: "รับหน้าที่ล้างจานหลังอาหารเย็น เช็ดให้แห้ง และเก็บเข้าตู้", category: "family" },
  { title: "ให้อาหารนก", description: "โรยข้าวสารหรือเมล็ดธัญพืชเล็กน้อยในสวน แล้วดูว่ามีนกอะไรมาบ้าง", category: "animals" },
  { title: "เก็บขยะ 5 ชิ้น", description: "พกถุงเล็ก ๆ ไปเดินเล่น เก็บขยะที่เจอ", category: "environment" },
  { title: "อ่านนิทานให้น้องฟัง", description: "เลือกหนังสือเล่มโปรด แล้วอ่านให้น้องฟัง 10 นาที", category: "education" },
];

export function stubSuggestOpportunities(locale: Locale, count: number): Opportunity[] {
  const source = locale === "th" ? DEMO_OPPS_TH : DEMO_OPPS_EN;
  return source.slice(0, Math.max(1, Math.min(count, source.length)));
}
