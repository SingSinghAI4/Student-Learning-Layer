// ── Subject + Chapter data ──────────────────────────────────────────────────
export type SubjectId = "english" | "maths" | "science" | "social" | "arts" | "health" | "tokpisin" | "values";

export interface ChapterData {
  id: number;
  title: string;
  tok: string;
  desc: string;
  icon: string;
  stars: number;      // 0-3 earned
  unlocked: boolean;
}

export const SUBJECTS = [
  {
    id: "english" as SubjectId,
    name: "English",
    tok: "Ritim & Raitin",
    icon: "📚",
    emoji: "📖",
    color: "#52B788",
    shadow: "rgba(82,183,136,0.5)",
    bg: "linear-gradient(160deg,#163d28 0%,#0c2518 100%)",
    desc: "Reading · Phonics · Sentences",
    starsEarned: 8,
    starsTotal: 18,
  },
  {
    id: "maths" as SubjectId,
    name: "Maths",
    tok: "Matematik",
    icon: "🔢",
    emoji: "🧮",
    color: "#FFD93D",
    shadow: "rgba(255,217,61,0.5)",
    bg: "linear-gradient(160deg,#3d3200 0%,#1a1500 100%)",
    desc: "Counting · Adding · Subtracting",
    starsEarned: 5,
    starsTotal: 18,
  },
  {
    id: "science" as SubjectId,
    name: "Science",
    tok: "Sains",
    icon: "🔬",
    emoji: "🌿",
    color: "#A8DADC",
    shadow: "rgba(168,218,220,0.5)",
    bg: "linear-gradient(160deg,#0a2535 0%,#040e1a 100%)",
    desc: "Animals · Plants · Environment",
    starsEarned: 3,
    starsTotal: 18,
  },
  {
    id: "social" as SubjectId,
    name: "Social Science",
    tok: "Sosial Sains",
    icon: "🏘️",
    emoji: "🗺️",
    color: "#FB923C",
    shadow: "rgba(251,146,60,0.5)",
    bg: "linear-gradient(160deg,#3d1a00 0%,#1a0c00 100%)",
    desc: "Community · PNG Map · Family",
    starsEarned: 2,
    starsTotal: 18,
  },
  {
    id: "arts" as SubjectId,
    name: "Creative Arts",
    tok: "Ati",
    icon: "🎨",
    emoji: "🎭",
    color: "#C4B5FD",
    shadow: "rgba(196,181,253,0.5)",
    bg: "linear-gradient(160deg,#1e0a35 0%,#0d0518 100%)",
    desc: "Drawing · Music · Craft",
    starsEarned: 1,
    starsTotal: 18,
  },
  {
    id: "health" as SubjectId,
    name: "Health",
    tok: "Helt",
    icon: "❤️",
    emoji: "🏃",
    color: "#F9A8D4",
    shadow: "rgba(249,168,212,0.5)",
    bg: "linear-gradient(160deg,#3d0a1e 0%,#1a040e 100%)",
    desc: "Hygiene · Food · Safety",
    starsEarned: 0,
    starsTotal: 18,
  },
  {
    id: "tokpisin" as SubjectId,
    name: "Tok Pisin",
    tok: "Tokples",
    icon: "🗣️",
    emoji: "💬",
    color: "#67E8F9",
    shadow: "rgba(103,232,249,0.5)",
    bg: "linear-gradient(160deg,#002535 0%,#000e1a 100%)",
    desc: "Harim · Toktok · Stori",
    starsEarned: 0,
    starsTotal: 18,
  },
  {
    id: "values" as SubjectId,
    name: "Values",
    tok: "Gut Pasin",
    icon: "⭐",
    emoji: "🤝",
    color: "#FCD34D",
    shadow: "rgba(252,211,77,0.5)",
    bg: "linear-gradient(160deg,#3d2a00 0%,#1a1000 100%)",
    desc: "Rispek · Tim Wok · Lidaship",
    starsEarned: 0,
    starsTotal: 18,
    // Inspired by David Mead's Voice Against Violence / League Bilong Laif program
  },
];

export const CHAPTERS: Record<SubjectId, ChapterData[]> = {
  english: [
    { id:1, title:"First Words",     tok:"Namba Wan Wod",    desc:"Letters A-M · sound matching",   icon:"A", stars:3, unlocked:true  },
    { id:2, title:"Beni na Mango",   tok:"Stori Bilong Beni",desc:"Story reading · word match",      icon:"B", stars:2, unlocked:true  },
    { id:3, title:"Kila na Solwara", tok:"Stori Bilong Kila",desc:"Beach story · comprehension",     icon:"K", stars:1, unlocked:true  },
    { id:4, title:"My Family",       tok:"Famili Bilong Mi", desc:"Sentences · family words",        icon:"F", stars:0, unlocked:true  },
    { id:5, title:"The Market",      tok:"Maket",            desc:"Advanced reading · dialogue",     icon:"M", stars:0, unlocked:false },
    { id:6, title:"Letter Writing",  tok:"Raitin Leta",      desc:"Composition · full sentences",    icon:"L", stars:0, unlocked:false },
  ],
  maths: [
    { id:1, title:"Counting 1-10",   tok:"Kauntim 1-10",     desc:"Numbers · one-to-one",            icon:"1", stars:3, unlocked:true  },
    { id:2, title:"Adding Up",       tok:"Putim Wantaim",    desc:"Addition at the market",           icon:"+", stars:0, unlocked:true  },
    { id:3, title:"Taking Away",     tok:"Kisim Ausait",     desc:"Subtraction · story problems",    icon:"−", stars:0, unlocked:true  },
    { id:4, title:"Shapes",          tok:"Sip",              desc:"2D shapes · sorting",             icon:"◇", stars:0, unlocked:false },
    { id:5, title:"Measuring",       tok:"Mesarim",          desc:"Length · weight · volume",        icon:"~", stars:0, unlocked:false },
    { id:6, title:"Money",           tok:"Mani",             desc:"Kina & toea · real-world maths",  icon:"K", stars:0, unlocked:false },
  ],
  science: [
    { id:1, title:"Animals",         tok:"Animal",           desc:"Sea · land · birds of PNG",       icon:"A", stars:2, unlocked:true  },
    { id:2, title:"Plants",          tok:"Diwai & Gras",     desc:"Gardens · trees · food crops",    icon:"P", stars:1, unlocked:true  },
    { id:3, title:"Our Body",        tok:"Bodi Bilong Yumi", desc:"Body parts · healthy living",     icon:"B", stars:0, unlocked:false },
    { id:4, title:"Weather",         tok:"Taim",             desc:"Rain · sun · PNG seasons",        icon:"W", stars:0, unlocked:false },
    { id:5, title:"Ocean",           tok:"Solwara",          desc:"Marine life · coral reefs",       icon:"O", stars:0, unlocked:false },
    { id:6, title:"Environment",     tok:"Graun",            desc:"Conservation · clean water",      icon:"E", stars:0, unlocked:false },
  ],
  social: [
    { id:1, title:"My Community",    tok:"Komuniti Bilong Mi",  desc:"Helpers · roles · belonging",       icon:"C", stars:2, unlocked:true  },
    { id:2, title:"PNG Map",         tok:"Map Bilong PNG",       desc:"Provinces · islands · capital",     icon:"M", stars:0, unlocked:true  },
    { id:3, title:"Family Life",     tok:"Laip Bilong Famili",   desc:"Roles · respect · sharing",         icon:"F", stars:0, unlocked:true  },
    { id:4, title:"Market & Trade",  tok:"Maket na Tred",        desc:"Buying · selling · money use",      icon:"T", stars:0, unlocked:false },
    { id:5, title:"PNG Culture",     tok:"Kastom Bilong PNG",    desc:"Traditions · dress · ceremonies",   icon:"K", stars:0, unlocked:false },
    { id:6, title:"Our Land",        tok:"Graun Bilong Yumi",    desc:"Caring for environment & land",     icon:"L", stars:0, unlocked:false },
  ],
  arts: [
    { id:1, title:"Colours & Shapes", tok:"Kala na Sip",        desc:"Primary colours · basic shapes",    icon:"C", stars:1, unlocked:true  },
    { id:2, title:"Drawing",          tok:"Droim",               desc:"Lines · patterns · nature art",     icon:"D", stars:0, unlocked:true  },
    { id:3, title:"PNG Patterns",     tok:"Pasin Bilong PNG",    desc:"Bilum · tapa · traditional art",    icon:"P", stars:0, unlocked:true  },
    { id:4, title:"Music & Songs",    tok:"Musik na Singsing",   desc:"Rhythm · PNG songs · clapping",     icon:"M", stars:0, unlocked:false },
    { id:5, title:"Drama & Story",    tok:"Drama",               desc:"Acting · storytelling · puppets",   icon:"S", stars:0, unlocked:false },
    { id:6, title:"Craft",            tok:"Wok Han",             desc:"Weaving · clay · natural materials",icon:"W", stars:0, unlocked:false },
  ],
  health: [
    { id:1, title:"Keeping Clean",    tok:"Karim Kliin",         desc:"Washing · teeth · hair · nails",    icon:"K", stars:0, unlocked:true  },
    { id:2, title:"Healthy Food",     tok:"Kaikai Gutpela",      desc:"PNG foods · balanced diet",         icon:"F", stars:0, unlocked:true  },
    { id:3, title:"Safety First",     tok:"Seif Pas",            desc:"Road safety · water · fire",        icon:"S", stars:0, unlocked:true  },
    { id:4, title:"Exercise & Play",  tok:"Eksasaiz na Pilai",   desc:"Movement · sport · body fitness",   icon:"E", stars:0, unlocked:false },
    { id:5, title:"Our Body",         tok:"Bodi Bilong Yumi",    desc:"Body parts · senses · growth",      icon:"B", stars:0, unlocked:false },
    { id:6, title:"Feelings",         tok:"Pilim",               desc:"Emotions · wellbeing · respect",    icon:"H", stars:0, unlocked:false },
  ],
  tokpisin: [
    { id:1, title:"Harim gut",        tok:"Harim",               desc:"Listening · following instructions",icon:"H", stars:0, unlocked:true  },
    { id:2, title:"Toktok",           tok:"Toktok",              desc:"Speaking · greetings · asking",     icon:"T", stars:0, unlocked:true  },
    { id:3, title:"Stori",            tok:"Stori",               desc:"Short stories in Tok Pisin",        icon:"S", stars:0, unlocked:true  },
    { id:4, title:"Singsing",         tok:"Singsing",            desc:"Songs · rhymes · counting",         icon:"M", stars:0, unlocked:false },
    { id:5, title:"Raitim Wod",       tok:"Raitim",              desc:"Writing simple Tok Pisin words",    icon:"R", stars:0, unlocked:false },
    { id:6, title:"Toktok Hevi",      tok:"Hevi",                desc:"Expressing needs & opinions",       icon:"X", stars:0, unlocked:false },
  ],
  // Values curriculum — inspired by David Mead's Voice Against Violence (VAV)
  // program, delivered through NRL's League Bilong Laif in PNG schools
  values: [
    { id:1, title:"Respect",          tok:"Rispek",              desc:"Respecting self, others & elders",  icon:"R", stars:0, unlocked:true  },
    { id:2, title:"Teamwork",         tok:"Tim Wok",             desc:"Working together · helping each other",icon:"T", stars:0, unlocked:true  },
    { id:3, title:"Say No to Violence",tok:"No Vailens",         desc:"Voice Against Violence · safe choices",icon:"V", stars:0, unlocked:true  },
    { id:4, title:"Equality",         tok:"Ikuliti",             desc:"Boys & girls equal · fairness",     icon:"E", stars:0, unlocked:false },
    { id:5, title:"Leadership",       tok:"Lidaship",            desc:"Being a role model · David Mead",   icon:"L", stars:0, unlocked:false },
    { id:6, title:"Healthy Choices",  tok:"Gutpela Laip",        desc:"Food · sport · staying safe",       icon:"H", stars:0, unlocked:false },
  ],
};

// ── Grade 2 Maths Chapter 2: "Putim Wantaim" (Adding Up) ────────────────────

export interface MathsStoryPage {
  scene: string;
  tok: string;
  en: string;
  words: string[];
  // Optional interactivity — student must complete before Next is shown
  interactive?: "tap-count" | "tap-add";
  tapEmoji?: string;   // emoji to count (tap-count)
  tapCount?: number;   // how many to tap
  tapGroupA?: string;  // left group emoji (tap-add)
  tapGroupB?: string;  // right group emoji (tap-add)
  tapCountA?: number;  // left group size
  tapCountB?: number;  // right group size
}

// Shared story — Beni at the Goroka market (10 slides, 3 interactive)
export const MATHS_STORY_PAGES: MathsStoryPage[] = [
  {
    scene: "🌅🏡🌿🦜",
    tok: "Long Satade moning tru, Beni i kirap na amamas tumas.",
    en: "Early Saturday morning, Beni woke up very excited.",
    words: ["Long", "Satade", "moning", "tru,", "Beni", "i", "kirap", "na", "amamas", "tumas."],
  },
  {
    scene: "👩‍👦🌴🏘️",
    tok: "Mama i tok: 'Beni, yumi go long maket tude!' Beni i amamas tru.",
    en: "Mama said: 'Beni, let us go to the market today!' Beni was so happy.",
    words: ["Mama", "i", "tok:", "'Beni,", "yumi", "go", "long", "maket", "tude!'", "Beni", "i", "amamas", "tru."],
  },
  {
    scene: "🚶‍♀️🚶🌿🏪",
    tok: "Beni na Mama i wokabaut i go long maket. Maket i gat planti frut!",
    en: "Beni and Mama walked to the market. The market had lots of fruit!",
    words: ["Beni", "na", "Mama", "i", "wokabaut", "i", "go", "long", "maket.", "Maket", "i", "gat", "planti", "frut!"],
  },
  {
    // Interactive — tap each mango to count
    scene: "🥭",
    tok: "Mama i lukim mango! Pres wanwan mango bilong kauntim!",
    en: "Mama saw mangoes! Tap each mango to count them!",
    words: ["Mama", "i", "lukim", "mango!", "Pres", "wanwan", "mango", "bilong", "kauntim!"],
    interactive: "tap-count",
    tapEmoji: "🥭",
    tapCount: 2,
  },
  {
    scene: "🥭🥭🛒",
    tok: "Gutpela! 2 mango! Mama i baim 2-pela mango. Beni i holim basket.",
    en: "Great! 2 mangoes! Mama bought 2 mangoes. Beni held the basket.",
    words: ["Gutpela!", "2", "mango!", "Mama", "i", "baim", "2-pela", "mango.", "Beni", "i", "holim", "basket."],
  },
  {
    // Interactive — tap each coconut to count
    scene: "🥥",
    tok: "Orait, Beni i lukim kokonas tu! Pres wanwan kokonas — kauntim!",
    en: "Then Beni saw coconuts too! Tap each coconut — count them!",
    words: ["Orait,", "Beni", "i", "lukim", "kokonas", "tu!", "Pres", "wanwan", "kokonas", "—", "kauntim!"],
    interactive: "tap-count",
    tapEmoji: "🥥",
    tapCount: 3,
  },
  {
    scene: "🥥🥥🥥🛒",
    tok: "Yes! 3 kokonas! Mama i baim 3 kokonas. Nau basket i gat mango na kokonas.",
    en: "Yes! 3 coconuts! Mama bought 3 coconuts. Now the basket has mangoes and coconuts.",
    words: ["Yes!", "3", "kokonas!", "Mama", "i", "baim", "3", "kokonas.", "Nau", "basket", "i", "gat", "mango", "na", "kokonas."],
  },
  {
    // Interactive — tap + to combine groups
    scene: "🥭🥭➕🥥🥥🥥",
    tok: "Beni i gat 2 mango na 3 kokonas. Pres PLUS bilong putim wantaim!",
    en: "Beni has 2 mangoes and 3 coconuts. Tap PLUS to add them together!",
    words: ["Beni", "i", "gat", "2", "mango", "na", "3", "kokonas.", "Pres", "PLUS", "bilong", "putim", "wantaim!"],
    interactive: "tap-add",
    tapGroupA: "🥭",
    tapCountA: 2,
    tapGroupB: "🥥",
    tapCountB: 3,
  },
  {
    scene: "🥭🥭🥥🥥🥥  ＝  5️⃣  ⭐",
    tok: "5 olgeta! Beni i kauntim gut tru. Gutpela wok, Beni!",
    en: "5 altogether! Beni counted perfectly. Great work, Beni!",
    words: ["5", "olgeta!", "Beni", "i", "kauntim", "gut", "tru.", "Gutpela", "wok,", "Beni!"],
  },
  {
    scene: "🎯✨🏆",
    tok: "Nau EM I YU TEM! Traim askim bilong yu. Yu inap — bai yu winim!",
    en: "Now it is YOUR TURN! Try the questions. You can do it — you will win!",
    words: ["Nau", "EM", "I", "YU", "TEM!", "Traim", "askim", "bilong", "yu.", "Yu", "inap", "—", "bai", "yu", "winim!"],
  },
];

export interface MathsActivity {
  mode: "math";
  label: string;
  q: string;
  tok: string;
  visual: string;
  difficulty: number;
  addends: [number, number]; // [leftGroup, rightGroup] — used by TeachMoment
  emojiA: string;            // emoji for left group
  emojiB: string;            // emoji for right group
  options: { val: string; label: string; tok: string }[];
  correct: string;
}

// Meri path — support learner: visual emojis, Tok Pisin first, small numbers, story context (8 activities)
export const MATHS_ACTIVITIES_MERI: MathsActivity[] = [
  {
    mode: "math" as const,
    label: "Lukautim Stori! (Story Check)",
    q: "In the story — Beni counted 2 mangoes AND 3 coconuts. How many altogether?",
    tok: "Long stori — Beni i kauntim 2 mango NA 3 kokonas. Hamas olgeta?",
    visual: "🥭🥭  ➕  🥥🥥🥥  ＝  ❓",
    difficulty: 1,
    addends: [2, 3],
    emojiA: "🥭",
    emojiB: "🥥",
    options: [
      { val: "4", label: "4", tok: "Foa" },
      { val: "5", label: "5", tok: "Faiv" },
      { val: "6", label: "6", tok: "Sikis" },
    ],
    correct: "5",
  },
  {
    mode: "math" as const,
    label: "Isi Isi — 1 + 1",
    q: "Beni finds 1 banana on the tree. He finds 1 more. How many bananas?",
    tok: "Beni i painim 1 banana long diwai. Em i painim 1 moa. Hamas banana?",
    visual: "🍌  ➕  🍌  ＝  ❓",
    difficulty: 1,
    addends: [1, 1],
    emojiA: "🍌",
    emojiB: "🍌",
    options: [
      { val: "1", label: "1", tok: "Wan" },
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
    ],
    correct: "2",
  },
  {
    mode: "math" as const,
    label: "Kauntim Banana — 2 + 1",
    q: "Beni has 2 bananas. He finds 1 more on the ground. How many now?",
    tok: "Beni i gat 2 banana. Em i painim 1 moa long graun. Hamas nau?",
    visual: "🍌🍌  ➕  🍌  ＝  ❓",
    difficulty: 1,
    addends: [2, 1],
    emojiA: "🍌",
    emojiB: "🍌",
    options: [
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
      { val: "4", label: "4", tok: "Foa" },
    ],
    correct: "3",
  },
  {
    mode: "math" as const,
    label: "Maket Askim — 3 + 2",
    q: "Mama puts 3 coconuts in the basket. Beni adds 2 more. How many in the basket?",
    tok: "Mama i putim 3 kokonas long basket. Beni i putim 2 moa. Hamas long basket?",
    visual: "🥥🥥🥥  ➕  🥥🥥  ＝  ❓",
    difficulty: 1,
    addends: [3, 2],
    emojiA: "🥥",
    emojiB: "🥥",
    options: [
      { val: "4", label: "4", tok: "Foa" },
      { val: "5", label: "5", tok: "Faiv" },
      { val: "6", label: "6", tok: "Sikis" },
    ],
    correct: "5",
  },
  {
    mode: "math" as const,
    label: "Kauntim Frut — 4 + 1",
    q: "The market stall has 4 bananas. Mama buys 1 pineapple too. How many fruit altogether?",
    tok: "Stol i gat 4 banana. Mama i baim 1 painap tu. Hamas frut olgeta?",
    visual: "🍌🍌🍌🍌  ➕  🍍  ＝  ❓",
    difficulty: 1,
    addends: [4, 1],
    emojiA: "🍌",
    emojiB: "🍍",
    options: [
      { val: "4", label: "4", tok: "Foa" },
      { val: "6", label: "6", tok: "Sikis" },
      { val: "5", label: "5", tok: "Faiv" },
    ],
    correct: "5",
  },
  {
    mode: "math" as const,
    label: "Popo na Mango — 2 + 4",
    q: "Beni picks 2 papayas and puts them with 4 mangoes. How many fruit in the pile?",
    tok: "Beni i kisim 2 popo na putim wantaim 4 mango. Hamas frut olgeta?",
    visual: "🍈🍈  ➕  🥭🥭🥭🥭  ＝  ❓",
    difficulty: 2,
    addends: [2, 4],
    emojiA: "🍈",
    emojiB: "🥭",
    options: [
      { val: "5", label: "5", tok: "Faiv" },
      { val: "7", label: "7", tok: "Sevn" },
      { val: "6", label: "6", tok: "Sikis" },
    ],
    correct: "6",
  },
  {
    mode: "math" as const,
    label: "Strong Askim — 3 + 3",
    q: "Beni picks 3 papayas from one tree and 3 from another tree. How many papayas?",
    tok: "Beni i kisim 3 popo long wanpela diwai na 3 long narapela. Hamas popo?",
    visual: "🍈🍈🍈  ➕  🍈🍈🍈  ＝  ❓",
    difficulty: 2,
    addends: [3, 3],
    emojiA: "🍈",
    emojiB: "🍈",
    options: [
      { val: "5", label: "5", tok: "Faiv" },
      { val: "7", label: "7", tok: "Sevn" },
      { val: "6", label: "6", tok: "Sikis" },
    ],
    correct: "6",
  },
  {
    mode: "math" as const,
    label: "Stori Maths — Beni na Basket",
    q: "Beni puts 4 mangoes in the basket. Then he adds 2 coconuts. How many things in the basket?",
    tok: "Beni i putim 4 mango long basket. Orait em i putim 2 kokonas tu. Hamas samting long basket?",
    visual: "🧺 🥭🥭🥭🥭  ➕  🥥🥥  ＝  ❓",
    difficulty: 2,
    addends: [4, 2],
    emojiA: "🥭",
    emojiB: "🥥",
    options: [
      { val: "5", label: "5", tok: "Faiv" },
      { val: "6", label: "6", tok: "Sikis" },
      { val: "7", label: "7", tok: "Sevn" },
    ],
    correct: "6",
  },
];

// Challenge path — confident learner: harder numbers, no visual scaffold, English primary, word problems (8 activities)
export const MATHS_ACTIVITIES_SIONE: MathsActivity[] = [
  {
    mode: "math" as const,
    label: "Story Check — Fast!",
    q: "In the story, Beni counted 2 mangoes and 3 coconuts. What is 2 + 3?",
    tok: "Long stori, Beni i kauntim 2 mango na 3 kokonas. 2 + 3 = ?",
    visual: "",
    difficulty: 2,
    addends: [2, 3],
    emojiA: "🥭",
    emojiB: "🥥",
    options: [
      { val: "6", label: "6", tok: "Sikis" },
      { val: "5", label: "5", tok: "Faiv" },
      { val: "4", label: "4", tok: "Foa" },
    ],
    correct: "5",
  },
  {
    mode: "math" as const,
    label: "Round 1 — 4 + 3",
    q: "4 + 3 = ?  Think fast!",
    tok: "4 + 3 = ?  Tingting kwik!",
    visual: "",
    difficulty: 2,
    addends: [4, 3],
    emojiA: "🥭",
    emojiB: "🥥",
    options: [
      { val: "6", label: "6", tok: "Sikis" },
      { val: "8", label: "8", tok: "Et" },
      { val: "7", label: "7", tok: "Sevn" },
    ],
    correct: "7",
  },
  {
    mode: "math" as const,
    label: "Word Problem — 5 + 4",
    q: "Beni has 5 mangoes in his bag. At the market he buys 4 more. How many mangoes altogether?",
    tok: "Beni i gat 5 mango long bag bilong em. Long maket em i baim 4 moa. Hamas mango olgeta?",
    visual: "",
    difficulty: 2,
    addends: [5, 4],
    emojiA: "🥭",
    emojiB: "🥭",
    options: [
      { val: "8", label: "8", tok: "Et" },
      { val: "10", label: "10", tok: "Ten" },
      { val: "9", label: "9", tok: "Nain" },
    ],
    correct: "9",
  },
  {
    mode: "math" as const,
    label: "Flip It — 3 + 5",
    q: "Mama has 3 fish and 5 sweet potatoes in her market bag. How many food items altogether?",
    tok: "Mama i gat 3 pis na 5 kaukau long bag bilong em. Hamas kaikai olgeta?",
    visual: "🐟🐟🐟  ➕  🍠🍠🍠🍠🍠",
    difficulty: 2,
    addends: [3, 5],
    emojiA: "🐟",
    emojiB: "🍠",
    options: [
      { val: "7", label: "7", tok: "Sevn" },
      { val: "9", label: "9", tok: "Nain" },
      { val: "8", label: "8", tok: "Et" },
    ],
    correct: "8",
  },
  {
    mode: "math" as const,
    label: "Market Stall — 6 + 2",
    q: "A market stall has 6 coconuts and 2 papayas. How many items on the stall?",
    tok: "Wanpela stol long maket i gat 6 kokonas na 2 popo. Hamas samting long stol?",
    visual: "🥥🥥🥥🥥🥥🥥  ➕  🍈🍈",
    difficulty: 3,
    addends: [6, 2],
    emojiA: "🥥",
    emojiB: "🍈",
    options: [
      { val: "7", label: "7", tok: "Sevn" },
      { val: "9", label: "9", tok: "Nain" },
      { val: "8", label: "8", tok: "Et" },
    ],
    correct: "8",
  },
  {
    mode: "math" as const,
    label: "Kina Maths — Real World!",
    q: "Mama spent K7 on fruit and K3 on fish at the market. How many kina did she spend in total?",
    tok: "Mama i baim frut K7 na pis K3 long maket. Hamas kina em i baim olgeta?",
    visual: "",
    difficulty: 3,
    addends: [7, 3],
    emojiA: "💰",
    emojiB: "💰",
    options: [
      { val: "9",  label: "K9",  tok: "Nain Kina" },
      { val: "11", label: "K11", tok: "Ileven Kina" },
      { val: "10", label: "K10", tok: "Ten Kina" },
    ],
    correct: "10",
  },
  {
    mode: "math" as const,
    label: "Level Up — 8 + 4",
    q: "Beni's family harvested 8 coconuts in the morning and 4 in the afternoon. How many altogether?",
    tok: "Famili bilong Beni i kisim 8 kokonas long moning na 4 long apinun. Hamas olgeta?",
    visual: "",
    difficulty: 3,
    addends: [8, 4],
    emojiA: "🥥",
    emojiB: "🥥",
    options: [
      { val: "11", label: "11", tok: "Ileven" },
      { val: "13", label: "13", tok: "Tetin" },
      { val: "12", label: "12", tok: "Twelv" },
    ],
    correct: "12",
  },
  {
    mode: "math" as const,
    label: "Expert Round — 8 + 5",
    q: "Beni's uncle sold 8 baskets of corn in the morning and 5 in the afternoon. How many baskets altogether?",
    tok: "Uncle bilong Beni i salim 8 basket kon long moning na 5 long apinun. Hamas basket olgeta?",
    visual: "",
    difficulty: 4,
    addends: [8, 5],
    emojiA: "🌽",
    emojiB: "🌽",
    options: [
      { val: "12", label: "12", tok: "Twelv" },
      { val: "14", label: "14", tok: "Fotiːn" },
      { val: "13", label: "13", tok: "Tetin" },
    ],
    correct: "13",
  },
];

export const AVATARS = [
  { emoji: "🦜", name: "Bird of Paradise", tok: "Pisin Paradais" },
  { emoji: "🦘", name: "Cassowary", tok: "Muruk" },
  { emoji: "🐊", name: "Crocodile", tok: "Pukpuk" },
  { emoji: "🐢", name: "Turtle", tok: "Honu" },
  { emoji: "🦋", name: "Butterfly", tok: "Bataplai" },
  { emoji: "🐠", name: "Coral Fish", tok: "Pis Solwara" },
];

export const DIAG_QUESTIONS = [
  {
    q: "Which picture shows 3 coconuts?",
    tok: "Wanem piksa i soim 3 kokonas?",
    topic: "Visual Counting",
    correctReason: "Visual one-to-one counting confirmed. Number sense present.",
    wrongReason: "One-to-one counting gap detected. May be counting by rote only.",
    options: [
      { emoji: "🥥🥥", label: "2", tok: "Tu" },
      { emoji: "🥥🥥🥥", label: "3", tok: "Tri" },
      { emoji: "🥥", label: "1", tok: "Wan" },
      { emoji: "🥥🥥🥥🥥", label: "4", tok: "Foa" },
    ],
    correct: 1,
  },
  {
    q: 'Which word starts with the letter "M"?',
    tok: 'Wanem wod i stat long leta "M"?',
    topic: "Letter-Onset Recognition",
    correctReason: "Letter-onset mapping confirmed. Phonemic awareness emerging.",
    wrongReason: "Letter-onset confusion noted. Will front-load phonics content.",
    options: [
      { emoji: "🍌", label: "Banana", tok: "Banana" },
      { emoji: "🥭", label: "Mango", tok: "Mango" },
      { emoji: "🍠", label: "Potato", tok: "Poteito" },
      { emoji: "🐟", label: "Fish", tok: "Pis" },
    ],
    correct: 1,
  },
  {
    q: "Meri has 5 mangoes. She gives 2 away. How many left?",
    tok: "Meri i gat 5 mango. Em i givim 2. Hamas i stap?",
    topic: "Contextual Subtraction",
    correctReason: "Can extract maths from narrative context. Strong reasoning link.",
    wrongReason: "Subtraction from context unclear. Will scaffold with visual counters.",
    options: [
      { emoji: "2", label: "2", tok: "Tu" },
      { emoji: "4", label: "4", tok: "Foa" },
      { emoji: "3", label: "3", tok: "Tri" },
      { emoji: "7", label: "7", tok: "Sevn" },
    ],
    correct: 2,
  },
  {
    q: "Which animal lives in the sea?",
    tok: "Wanem animal i stap long solwara?",
    topic: "Environmental Categorisation",
    correctReason: "Real-world habitat categorisation solid. Good background knowledge.",
    wrongReason: "Habitat concepts unclear — will weave into contextual stories.",
    options: [
      { emoji: "🐊", label: "Crocodile", tok: "Pukpuk" },
      { emoji: "🦜", label: "Bird", tok: "Pisin" },
      { emoji: "🐠", label: "Fish", tok: "Pis" },
      { emoji: "🐷", label: "Pig", tok: "Pik" },
    ],
    correct: 2,
  },
  {
    q: "Which sentence is correct?",
    tok: "Wanem tok i stret?",
    topic: "Sentence Grammar",
    correctReason: "Subject-verb agreement detected. Advanced literacy signal for this grade.",
    wrongReason: "Grammar pattern not yet forming. Will use sentence-building activities.",
    options: [
      { emoji: "📝", label: "Dog run fast", tok: "Dok i ran fas" },
      { emoji: "📝", label: "The dog runs fast", tok: "Dok i ran fas tru" },
      { emoji: "📝", label: "Run dog fast the", tok: "Ran dok fas" },
      { emoji: "📝", label: "Fast dog the run", tok: "Fas dok ran" },
    ],
    correct: 1,
  },
];

export const STORY_PAGES = [
  {
    scene: "🌄🏡🌿",
    tok: "Long moning tru, Beni i kirap.",
    en: "Early in the morning, Beni woke up.",
    words: ["Long", "moning", "tru,", "Beni", "i", "kirap."],
  },
  {
    scene: "🌿🥭🧺",
    tok: "Em i go long gaden bilong mama.",
    en: "He went to his mother's garden.",
    words: ["Em", "i", "go", "long", "gaden", "bilong", "mama."],
  },
  {
    scene: "🥭🥭🥭🥭🥭",
    tok: "Beni i lukim 5-pela mango i stap.",
    en: "Beni saw 5 mangoes on the tree.",
    words: ["Beni", "i", "lukim", "5-pela", "mango", "i", "stap."],
  },
  {
    scene: "👵🥭🥭🥭",
    tok: "Tumbuna meri i kam na kisim 3.",
    en: "Grandmother came and took 3.",
    words: ["Tumbuna", "meri", "i", "kam", "na", "kisim", "3."],
  },
  {
    scene: "🤔🥭🥭",
    tok: "Hamas mango i stap yet?",
    en: "How many mangoes are left?",
    words: ["Hamas", "mango", "i", "stap", "yet?"],
  },
];

// ── Chapter 1: Story "Beni na Mango" ─── counting · reading · math
export const ACTIVITIES = [
  {
    mode: "count" as const,
    label: "Kauntim (Counting)",
    q: "How many mangoes are left after Grandma took 3?",
    tok: "Hamas mango i stap yet?",
    visual: "🥭🥭",
    difficulty: 1,
    options: [
      { val: "1", label: "1", tok: "Wan" },
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
    ],
    correct: "2",
  },
  {
    mode: "word" as const,
    label: "Ritim (Reading)",
    q: 'Which picture matches the word "MANGO"?',
    tok: 'Wanem piksa i makim wod "MANGO"?',
    visual: "",
    difficulty: 1,
    options: [
      { val: "mango", label: "🥭 Mango", tok: "Mango" },
      { val: "fish",  label: "🐟 Fish",  tok: "Pis" },
      { val: "bird",  label: "🦜 Bird",  tok: "Pisin" },
    ],
    correct: "mango",
  },
  {
    mode: "math" as const,
    label: "Matematik (Subtraction)",
    q: "5 take away 3 equals?",
    tok: "5 mainas 3 em i wanem namba?",
    visual: "🥭🥭🥭🥭🥭  ➡  🥭🥭🥭❌❌",
    difficulty: 1,
    options: [
      { val: "2", label: "2", tok: "Tu" },
      { val: "3", label: "3", tok: "Tri" },
      { val: "4", label: "4", tok: "Foa" },
    ],
    correct: "2",
  },
];

// ── Chapter 2: Story "Kila na Solwara" ─── phonics · comprehension · number bonds · writing
export const ACTIVITIES_2 = [
  {
    mode: "word" as const,
    label: "Fonikis (Phonics)",
    q: 'Which word starts with the sound "K"?',
    tok: 'Wanem wod i stat long soun "K"?',
    visual: "🔤",
    difficulty: 2,
    options: [
      { val: "kila",  label: "🦜 Kila",  tok: "Kila" },
      { val: "fish",  label: "🐠 Fish",  tok: "Pis" },
      { val: "mango", label: "🥭 Mango", tok: "Mango" },
    ],
    correct: "kila",
  },
  {
    mode: "count" as const,
    label: "Save Stori (Comprehension)",
    q: "Where did Kila go in the story?",
    tok: "Kila i go we long stori?",
    visual: "🤔",
    difficulty: 2,
    options: [
      { val: "beach",  label: "🏖️ Beach",  tok: "Nambis" },
      { val: "garden", label: "🌿 Garden", tok: "Gaden" },
      { val: "school", label: "🏫 School", tok: "Skul" },
    ],
    correct: "beach",
  },
  {
    mode: "math" as const,
    label: "Namba Bond (Number Bonds)",
    q: "3 plus ___ equals 7",
    tok: "3 + ___ = 7. Wanem namba?",
    visual: "🐠🐠🐠  +  ❓❓❓❓ = 7️⃣",
    difficulty: 2,
    options: [
      { val: "3", label: "3", tok: "Tri" },
      { val: "4", label: "4", tok: "Foa" },
      { val: "5", label: "5", tok: "Faiv" },
    ],
    correct: "4",
  },
  {
    mode: "word" as const,
    label: "Baim Tok (Sentence Fill)",
    q: 'Complete the sentence: "The fish lives in the ___."',
    tok: '"Pis i stap long ___."',
    visual: "🐠 ➡ ___",
    difficulty: 2,
    options: [
      { val: "sea",  label: "🌊 Sea",   tok: "Solwara" },
      { val: "tree", label: "🌲 Tree",  tok: "Diwai" },
      { val: "sky",  label: "☁️ Sky",   tok: "Skai" },
    ],
    correct: "sea",
  },
];

// ── Chapter 2 Story: "Kila na Solwara" ─────────────────────────────────────
export const STORY_PAGES_2 = [
  {
    scene: "🌊🏖️🌴",
    tok: "Kila i go long nambis long moning.",
    en: "Kila went to the beach in the morning.",
    words: ["Kila", "i", "go", "long", "nambis", "long", "moning."],
  },
  {
    scene: "🌊🐠🦀🦑",
    tok: "Em i lukim planti animal long solwara.",
    en: "She saw many animals in the sea.",
    words: ["Em", "i", "lukim", "planti", "animal", "long", "solwara."],
  },
  {
    scene: "🐠🔤✏️",
    tok: "Kila i raitim nem bilong olgeta pis.",
    en: "Kila wrote the names of all the fish.",
    words: ["Kila", "i", "raitim", "nem", "bilong", "olgeta", "pis."],
  },
  {
    scene: "🌅🦜📖",
    tok: "Em i lainim planti samting tude. Gutpela tru!",
    en: "She learned many things today. Well done!",
    words: ["Em", "i", "lainim", "planti", "samting", "tude.", "Gutpela", "tru!"],
  },
];

export const CLASS_STUDENTS = [
  { name: "Kila",  emoji: "🦜", grade: 2, status: "flying"    as const, mastery: 87, skill: "Addition",     time: "12m" },
  { name: "Beni",  emoji: "🦘", grade: 2, status: "attention" as const, mastery: 34, skill: "Letter b/d",   time: "18m" },
  { name: "Meri",  emoji: "🐢", grade: 2, status: "on-track"  as const, mastery: 65, skill: "Counting",     time: "15m" },
  { name: "Tama",  emoji: "🐠", grade: 2, status: "on-track"  as const, mastery: 71, skill: "Sentences",    time: "14m" },
  { name: "Saina", emoji: "🦋", grade: 2, status: "on-track"  as const, mastery: 68, skill: "Subtraction",  time: "16m" },
  { name: "Peni",  emoji: "🦜", grade: 2, status: "inactive"  as const, mastery: 20, skill: "Phonics",      time: "3d ago" },
  { name: "Hera",  emoji: "🐊", grade: 2, status: "flying"    as const, mastery: 91, skill: "Word Matching", time: "10m" },
  { name: "Walo",  emoji: "🐢", grade: 2, status: "attention" as const, mastery: 41, skill: "Number bonds", time: "20m" },
  { name: "Karo",  emoji: "🦋", grade: 2, status: "on-track"  as const, mastery: 73, skill: "Reading",      time: "13m" },
  { name: "Naomi", emoji: "🐠", grade: 2, status: "on-track"  as const, mastery: 60, skill: "Counting",     time: "17m" },
  { name: "Soki",  emoji: "🦜", grade: 2, status: "flying"    as const, mastery: 84, skill: "Sentences",    time: "11m" },
  { name: "Waina", emoji: "🐊", grade: 2, status: "attention" as const, mastery: 38, skill: "Letter sounds", time: "22m" },
  { name: "John",  emoji: "🦘", grade: 2, status: "on-track"  as const, mastery: 55, skill: "Addition",     time: "15m" },
  { name: "Rosa",  emoji: "🦋", grade: 2, status: "on-track"  as const, mastery: 62, skill: "Subtraction",  time: "14m" },
  { name: "Peter", emoji: "🐢", grade: 2, status: "inactive"  as const, mastery: 15, skill: "Phonics",      time: "5d ago" },
  { name: "Mary",  emoji: "🐠", grade: 2, status: "on-track"  as const, mastery: 70, skill: "Reading",      time: "16m" },
  { name: "James", emoji: "🦜", grade: 2, status: "flying"    as const, mastery: 89, skill: "Math",         time: "9m" },
  { name: "Grace", emoji: "🦋", grade: 2, status: "on-track"  as const, mastery: 64, skill: "Sentences",    time: "15m" },
];

// Cultural regions — each maps to a guardian dress style
export type CulturalRegion = "highlands" | "momase" | "papuan" | "islands";

export const PROVINCE_DATA: {
  name: string;
  status: "active" | "warn" | "off";
  region: CulturalRegion;
  // Position on the PNG map SVG (viewBox 0 0 520 380)
  mapX: number;
  mapY: number;
  // Bilum food item from this province
  food: string;
}[] = [
  { name: "NCD",          status: "active", region: "papuan",     mapX: 305, mapY: 230, food: "🥭" },
  { name: "Morobe",       status: "active", region: "momase",     mapX: 288, mapY: 148, food: "🍌" },
  { name: "E. Highlands", status: "active", region: "highlands",  mapX: 242, mapY: 162, food: "🥕" },
  { name: "W. Highlands", status: "active", region: "highlands",  mapX: 210, mapY: 168, food: "🍠" },
  { name: "Madang",       status: "active", region: "momase",     mapX: 228, mapY: 108, food: "🥥" },
  { name: "Milne Bay",    status: "warn",   region: "papuan",     mapX: 368, mapY: 222, food: "🐟" },
  { name: "Gulf",         status: "warn",   region: "papuan",     mapX: 245, mapY: 238, food: "🦀" },
  { name: "Chimbu",       status: "active", region: "highlands",  mapX: 232, mapY: 172, food: "🌽" },
  { name: "Oro",          status: "off",    region: "papuan",     mapX: 292, mapY: 196, food: "🍍" },
  { name: "Manus",        status: "active", region: "islands",    mapX: 295, mapY: 14,  food: "🐚" },
];

// Keep backward-compat alias
export const PROVINCES = PROVINCE_DATA.map(p => ({ name: p.name, status: p.status }));

// Guardian dress styles per cultural region
export const CULTURAL_REGIONS: Record<CulturalRegion, {
  label: string;
  headdressColor: string;
  featherColor: string;
  skirtColor: string;
  shellColor: string;
  faceMarkColor: string;
  glow: string;
  tok: string;   // region name in Tok Pisin
}> = {
  highlands: {
    label: "Highlands",
    headdressColor: "#8B1A1A",
    featherColor:   "#FFD700",
    skirtColor:     "#8B5E3C",
    shellColor:     "#FFF8DC",
    faceMarkColor:  "#CC0000",
    glow:           "rgba(255,215,0,0.55)",
    tok:            "Hailens",
  },
  momase: {
    label: "Momase",
    headdressColor: "#2E4A1E",
    featherColor:   "#FF6B00",
    skirtColor:     "#5C3D2E",
    shellColor:     "#E8D5A3",
    faceMarkColor:  "#1A3A2A",
    glow:           "rgba(255,107,0,0.5)",
    tok:            "Momase",
  },
  papuan: {
    label: "Papuan",
    headdressColor: "#1A3A5C",
    featherColor:   "#00BFFF",
    skirtColor:     "#2C5F2E",
    shellColor:     "#F0E6D3",
    faceMarkColor:  "#003366",
    glow:           "rgba(0,191,255,0.5)",
    tok:            "Papua",
  },
  islands: {
    label: "Islands",
    headdressColor: "#2D5A27",
    featherColor:   "#FF1493",
    skirtColor:     "#8B6914",
    shellColor:     "#FFE4B5",
    faceMarkColor:  "#006400",
    glow:           "rgba(255,20,147,0.5)",
    tok:            "Aisland",
  },
};
