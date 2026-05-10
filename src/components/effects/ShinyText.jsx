import "./ShinyText.css";

/* ShinyText (React Bits-style)
   An animated metallic sheen sweeps across the text. Inherits the parent
   font color via `currentColor`, but overlays a moving gradient highlight.
   Falls back to flat text if the user prefers reduced motion. */

export default function ShinyText({
  children,
  speed = 4.5,        // seconds per sweep
  intensity = 0.85,   // 0..1, how bright the sheen is
  className = "",
}) {
  return (
    <span
      className={`shiny-text ${className}`}
      style={{
        "--shine-speed": `${speed}s`,
        "--shine-intensity": intensity,
      }}
    >
      {children}
    </span>
  );
}
