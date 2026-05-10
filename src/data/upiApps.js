/* UPI app catalog — used by the Connect flow.
   Brand colors are accents; we render a high-contrast initials avatar instead
   of trademarked logos so we stay safe to ship without licensing. */

export const UPI_APPS = [
  {
    id: "gpay",
    name: "Google Pay",
    short: "GPay",
    color: "#34A853",
    initials: "GP",
    logo: "/upi-logos/googlepay.svg",
    handleHint: "name@oksbi",
  },
  {
    id: "phonepe",
    name: "PhonePe",
    short: "PhonePe",
    color: "#5F259F",
    initials: "PP",
    logo: "/upi-logos/phonepe.svg",
    handleHint: "name@ybl",
  },
  {
    id: "paytm",
    name: "Paytm",
    short: "Paytm",
    color: "#00BAF2",
    initials: "PT",
    logo: "/upi-logos/paytm.svg",
    handleHint: "name@paytm",
  },
  {
    id: "bhim",
    name: "BHIM",
    short: "BHIM",
    color: "#FF671F",
    initials: "₹",       // rupee glyph reads as the BHIM/UPI mark
    logo: null,
    handleHint: "name@upi",
  },
  {
    id: "amazonpay",
    name: "Amazon Pay",
    short: "Amazon",
    color: "#FF9900",
    initials: "AP",
    logo: "/upi-logos/amazonpay.svg",
    handleHint: "name@apl",
  },
  {
    id: "cred",
    name: "Cred",
    short: "Cred",
    color: "#0F172A",
    initials: "C",
    logo: null,
    handleHint: "name@axl",
  },
];

export function findUpiApp(id) {
  return UPI_APPS.find((a) => a.id === id) || null;
}

/** Build a `upi://pay?...` deep link that opens the user's default UPI app. */
export function buildUpiLink({ pa, pn, am, tn = "AuraLoop round-up" }) {
  const params = new URLSearchParams();
  if (pa) params.set("pa", pa);
  if (pn) params.set("pn", pn);
  if (am !== undefined) params.set("am", String(am));
  if (tn) params.set("tn", tn);
  params.set("cu", "INR");
  return `upi://pay?${params.toString()}`;
}

/** Validate a VPA format like "name@bank". Loose check, not a verifier. */
export function isValidVpa(value) {
  if (!value) return false;
  const v = value.trim().toLowerCase();
  return /^[a-z0-9._-]{2,}@[a-z][a-z0-9]{1,}$/.test(v);
}
