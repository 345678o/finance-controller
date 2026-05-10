/* Meme library — every meme is tagged with a mood:
   • "saved"  — celebratory / wholesome / future-you-thanks-you
   • "spent"  — guilt / oh-no / wallet-trauma
   The toast picks a random meme matching the mood that triggered it. If no
   memes exist for a mood, falls back to any.                                  */

export const MEMES = [
  // ── User-uploaded image memes (text baked into the image) ──────────
  {
    id: "money-book",
    src: "/memes/money-book.jpg",
    caption: "Future you, after one more round-up.",
    aspect: 1,
    mood: "saved",
  },
  {
    id: "dollar-sad",
    src: "/memes/dollar-sad.jpeg",
    caption: "POV: that ₹500 you spent on something you forgot.",
    aspect: 1.4,
    mood: "spent",
  },
  {
    id: "bugs-money",
    src: "/memes/bugs-money.jpeg",
    caption: "Hate budgets. Love that growing jar though.",
    aspect: 1,
    mood: "saved",
  },

  // ── Templates with overlay captions — "saved" mood ─────────────────
  {
    id: "stonks",
    src: "/memes/stonks.jpg",
    topText: "Skipped one Swiggy order",
    bottomText: "Round-up jar: ↗↗↗",
    caption: "Patience is the new flex.",
    aspect: 1,
    mood: "saved",
  },
  {
    id: "drake",
    src: "/memes/drake.jpg",
    topText: "Manually budgeting on a spreadsheet",
    bottomText: "Vibing while round-ups quietly stack",
    caption: "AuraLoop chose violence elegance.",
    aspect: 1,
    mood: "saved",
  },
  {
    id: "spiderman",
    src: "/memes/spiderman-point.jpg",
    topText: "Future me",
    bottomText: "Past me",
    caption: "Both of you. Stop fighting. Round-up.",
    aspect: 1.78,
    mood: "saved",
  },
  {
    id: "change-my-mind",
    src: "/memes/change-my-mind.jpg",
    topText: "",
    bottomText: "Round-ups are the best wealth hack",
    caption: "Change my mind. (You can't.)",
    aspect: 1.5,
    mood: "saved",
  },
  {
    id: "arya-not-today",
    src: "/memes/arya.jpg",
    topText: "What do we say to debt?",
    bottomText: "Not today",
    caption: "Round-ups, taking out the impulse buys one ₹47 at a time.",
    aspect: 1.81,
    mood: "saved",
  },

  // ── Templates with overlay captions — "spent" mood ─────────────────
  {
    id: "this-is-fine",
    src: "/memes/this-is-fine.jpg",
    topText: "Bank balance: ₹12",
    bottomText: "(this is fine)",
    caption: "Pretending payday is tomorrow when it's actually next week.",
    aspect: 1.78,
    mood: "spent",
  },
  {
    id: "surprised-pikachu",
    src: "/memes/surprised-pikachu.jpg",
    topText: "Spent it all on snacks",
    bottomText: "Wait, payday is when???",
    caption: "We do this to ourselves. Every. Single. Month.",
    aspect: 1.78,
    mood: "spent",
  },
  {
    id: "disaster-girl",
    src: "/memes/disaster-girl.jpg",
    topText: "POV: my budget",
    bottomText: "after one weekend",
    caption: "Smiling because the round-up jar caught the fall.",
    aspect: 1.5,
    mood: "spent",
  },
  {
    id: "two-buttons",
    src: "/memes/two-buttons.jpg",
    topText: "Save ₹150",
    bottomText: "Add one more thing for free shipping",
    caption: "Why are we like this.",
    aspect: 1,
    mood: "spent",
  },
  {
    id: "distracted-bf",
    src: "/memes/distracted-bf.jpg",
    topText: "My monthly budget",
    bottomText: "Limited-time-offer notification",
    caption: "Loyalty is fragile when the email subject is bold.",
    aspect: 1.5,
    mood: "spent",
  },
  {
    id: "first-world",
    src: "/memes/first-world-problems.jpg",
    topText: "Just spent ₹2,400",
    bottomText: "On things I cannot name",
    caption: "Where did the cart go. Where did the money go. Same energy.",
    aspect: 1,
    mood: "spent",
  },
  {
    id: "sweating",
    src: "/memes/sweating-towel.jpg",
    topText: "Bank app open",
    bottomText: "After payday weekend",
    caption: "It's the not-knowing that gets me.",
    aspect: 1.33,
    mood: "spent",
  },
  {
    id: "monkey-puppet",
    src: "/memes/monkey-puppet.jpg",
    topText: "Said I'd budget this month",
    bottomText: "Sees a sale on a thing I don't need",
    caption: "We do not speak of week 1.",
    aspect: 1.78,
    mood: "spent",
  },
  {
    id: "sad-pablo",
    src: "/memes/sad-pablo.jpg",
    topText: "₹3,200 gone in a weekend",
    bottomText: "What did I even buy",
    caption: "The receipts are silent. So is the bank balance.",
    aspect: 1.33,
    mood: "spent",
  },

  // ── More memes — saved mood ─────────────────────────────────────────
  {
    id: "expanding-brain-saved",
    src: "/memes/expanding-brain.jpg",
    topText: "Tracking spends in a notes app",
    bottomText: "Letting AuraLoop round up while you live your life",
    caption: "Galaxy-brain energy.",
    aspect: 0.87,
    mood: "saved",
  },
  {
    id: "bonk-doge",
    src: "/memes/bonk-doge.jpg",
    topText: "Wanted to buy 5th hoodie",
    bottomText: "Bonk. Round-up jar instead.",
    caption: "Self-discipline is a love language.",
    aspect: 1,
    mood: "saved",
  },

  // ── More memes — spent mood ─────────────────────────────────────────
  {
    id: "math-lady",
    src: "/memes/math-lady.jpg",
    topText: "Tried to budget this month",
    bottomText: "Where did ₹4,800 go??",
    caption: "The maths math'd. Then it didn't.",
    aspect: 1.78,
    mood: "spent",
  },
  {
    id: "harold",
    src: "/memes/harold.jpg",
    topText: "It's fine. Bank balance fine.",
    bottomText: "I'm fine.",
    caption: "Smiling through the spending. As one does.",
    aspect: 1.4,
    mood: "spent",
  },
  {
    id: "smudge-cat",
    src: "/memes/smudge-cat.jpg",
    topText: "Me, fully aware of my spend",
    bottomText: "*opens checkout anyway*",
    caption: "The cat understands. The bank does not.",
    aspect: 1.18,
    mood: "spent",
  },
];

/** Pick a random meme — optionally filtered to a mood ("saved" / "spent"). */
export function pickRandomMeme(mood) {
  const pool = mood ? MEMES.filter((m) => m.mood === mood) : MEMES;
  const list = pool.length ? pool : MEMES;
  return list[Math.floor(Math.random() * list.length)];
}
