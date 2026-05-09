export const inr = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

export const inrCompact = (n) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(n) || 0);

export const ceilTo = (n, step = 10) => Math.ceil(n / step) * step;

export const roundUp = (amount, step = 10) => {
  const target = ceilTo(amount, step);
  return Number((target - amount).toFixed(2));
};
