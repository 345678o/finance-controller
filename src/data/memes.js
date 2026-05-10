/* Meme library — all images live in /public/memes so they ship in the bundle
   and decode instantly (no network, no random returns).

   Two flavors:
   • User-uploaded memes have their text baked into the image — they only need
     a `caption` shown below.
   • Template memes use real meme-format captions overlaid on top + bottom of
     the image (classic Impact-style outline). The caption underneath is the
     narrator voice.                                                         */

export const MEMES = [
  // ── User-uploaded image memes (text baked into the image) ─────────
  {
    id: "money-book",
    src: "/memes/money-book.jpg",
    caption: "Future you, after one more round-up.",
    aspect: 1,
  },
  {
    id: "dollar-sad",
    src: "/memes/dollar-sad.jpeg",
    caption: "POV: that ₹500 you spent on something you forgot.",
    aspect: 1.4,
  },
  {
    id: "bugs-money",
    src: "/memes/bugs-money.jpeg",
    caption: "Hate budgets. Love that growing jar though.",
    aspect: 1,
  },

  // ── Templates with overlay captions ───────────────────────────────
  {
    id: "stonks",
    src: "/memes/stonks.jpg",
    topText: "Skipped one Swiggy order",
    bottomText: "Round-up jar: ↗↗↗",
    caption: "Patience is the new flex.",
    aspect: 1,
  },
  {
    id: "this-is-fine",
    src: "/memes/this-is-fine.jpg",
    topText: "Bank balance: ₹12",
    bottomText: "(this is fine)",
    caption: "Pretending payday is tomorrow when it's actually next week.",
    aspect: 1.78,
  },
  {
    id: "surprised-pikachu",
    src: "/memes/surprised-pikachu.jpg",
    topText: "Spent it all on snacks",
    bottomText: "Wait, payday is when???",
    caption: "We do this to ourselves. Every. Single. Month.",
    aspect: 1.78,
  },
  {
    id: "disaster-girl",
    src: "/memes/disaster-girl.jpg",
    topText: "POV: my budget",
    bottomText: "after one weekend",
    caption: "Smiling because the round-up jar caught the fall.",
    aspect: 1.5,
  },
  {
    id: "drake",
    src: "/memes/drake.jpg",
    topText: "Manually budgeting on a spreadsheet",
    bottomText: "Vibing while round-ups quietly stack",
    caption: "AuraLoop chose violence elegance.",
    aspect: 1,
  },
  {
    id: "two-buttons",
    src: "/memes/two-buttons.jpg",
    topText: "Save ₹150",
    bottomText: "Add one more thing for free shipping",
    caption: "Why are we like this.",
    aspect: 1,
  },
  {
    id: "spiderman",
    src: "/memes/spiderman-point.jpg",
    topText: "Future me",
    bottomText: "Past me",
    caption: "Both of you. Stop fighting. Round-up.",
    aspect: 1.78,
  },
  {
    id: "distracted-bf",
    src: "/memes/distracted-bf.jpg",
    topText: "My monthly budget",
    bottomText: "Limited-time-offer notification",
    caption: "Loyalty is fragile when the email subject is bold.",
    aspect: 1.5,
  },
  {
    id: "change-my-mind",
    src: "/memes/change-my-mind.jpg",
    topText: "",
    bottomText: "Round-ups are the best wealth hack",
    caption: "Change my mind. (You can't.)",
    aspect: 1.5,
  },
  {
    id: "arya-not-today",
    src: "/memes/arya.jpg",
    topText: "What do we say to debt?",
    bottomText: "Not today",
    caption: "Round-ups, taking out the impulse buys one ₹47 at a time.",
    aspect: 1.81,
  },
];

export function pickRandomMeme() {
  return MEMES[Math.floor(Math.random() * MEMES.length)];
}
