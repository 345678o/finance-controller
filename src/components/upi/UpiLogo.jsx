/* UpiLogo
   Renders a brand-tile for a UPI app: brand-color background with the white
   official mark on top. Uses CSS `mask-image` so a single monochrome SVG can
   paint in any color we want (no per-app PNGs, no recoloring filters).
   Apps without a logo file (BHIM, Cred) fall back to a glyph in white.       */

export default function UpiLogo({ app, size = 36, radius }) {
  const px = typeof size === "number" ? `${size}px` : size;
  const r  = radius ?? Math.round((typeof size === "number" ? size : 36) * 0.32);

  return (
    <span
      className="inline-grid shrink-0 place-items-center border-2 border-[#0F172A]"
      style={{
        width: px,
        height: px,
        borderRadius: r,
        background: app.color,
      }}
    >
      {app.logo ? (
        <span
          aria-hidden
          className="block"
          style={{
            width: "62%",
            height: "62%",
            background: "#FFFFFF",
            WebkitMask: `url(${app.logo}) center/contain no-repeat`,
            mask: `url(${app.logo}) center/contain no-repeat`,
          }}
        />
      ) : (
        <span
          className="font-extrabold text-white"
          style={{
            fontSize: typeof size === "number" ? Math.round(size * 0.5) : 18,
            lineHeight: 1,
            fontFamily:
              'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          }}
        >
          {app.initials}
        </span>
      )}
    </span>
  );
}
