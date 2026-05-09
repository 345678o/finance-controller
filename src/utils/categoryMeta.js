import {
  UtensilsCrossed,
  ShoppingCart,
  Car,
  ShoppingBag,
  Tv,
  Coffee,
  Sparkles,
  Music,
  Dumbbell,
  Plane,
  Fuel,
  Wallet,
} from "lucide-react";

// Restrained palette — only two brand hues (primary + accent), neutrals for the rest.
// Keeps the dashboard from looking like a candy store.
const PRIMARY  = { color: "#22C55E", soft: "#DCFCE7" }; // money / positive flow
const ACCENT   = { color: "#6366F1", soft: "#E0E7FF" }; // insight / discretionary
const WARN     = { color: "#F59E0B", soft: "#FEF3C7" };
const NEUTRAL  = { color: "#475569", soft: "#E2E8F0" };

const META = {
  Food:          { Icon: UtensilsCrossed, ...ACCENT  },
  Groceries:     { Icon: ShoppingCart,    ...PRIMARY },
  Transport:     { Icon: Car,             ...NEUTRAL },
  Shopping:      { Icon: ShoppingBag,     ...ACCENT  },
  Subscriptions: { Icon: Tv,              ...WARN    },
  Cafes:         { Icon: Coffee,          ...WARN    },
  Beauty:        { Icon: Sparkles,        ...ACCENT  },
  Entertainment: { Icon: Music,           ...ACCENT  },
  Fitness:       { Icon: Dumbbell,        ...PRIMARY },
  Travel:        { Icon: Plane,           ...NEUTRAL },
  Fuel:          { Icon: Fuel,            ...NEUTRAL },
};

export const metaForCategory = (category) =>
  META[category] || { Icon: Wallet, ...NEUTRAL };
