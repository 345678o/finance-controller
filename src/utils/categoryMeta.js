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

const META = {
  Food:          { Icon: UtensilsCrossed, color: "#ff2d92", glow: "rgba(255,45,146,0.55)" },
  Groceries:     { Icon: ShoppingCart,    color: "#00ffae", glow: "rgba(0,255,174,0.55)" },
  Transport:     { Icon: Car,             color: "#00e5ff", glow: "rgba(0,229,255,0.55)" },
  Shopping:      { Icon: ShoppingBag,     color: "#ffb020", glow: "rgba(255,176,32,0.55)" },
  Subscriptions: { Icon: Tv,              color: "#8b5cf6", glow: "rgba(139,92,246,0.55)" },
  Cafes:         { Icon: Coffee,          color: "#ffb020", glow: "rgba(255,176,32,0.55)" },
  Beauty:        { Icon: Sparkles,        color: "#ff2d92", glow: "rgba(255,45,146,0.55)" },
  Entertainment: { Icon: Music,           color: "#00e5ff", glow: "rgba(0,229,255,0.55)" },
  Fitness:       { Icon: Dumbbell,        color: "#00ffae", glow: "rgba(0,255,174,0.55)" },
  Travel:        { Icon: Plane,           color: "#00e5ff", glow: "rgba(0,229,255,0.55)" },
  Fuel:          { Icon: Fuel,            color: "#ffb020", glow: "rgba(255,176,32,0.55)" },
};

export const metaForCategory = (category) =>
  META[category] || { Icon: Wallet, color: "#a1a1aa", glow: "rgba(161,161,170,0.45)" };
