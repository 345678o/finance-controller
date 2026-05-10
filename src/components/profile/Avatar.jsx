/* Avatar
   One source of truth for rendering a profile avatar — uses the uploaded
   image if present, otherwise falls back to the chosen emoji. The outer
   tile keeps the neo-brutalist border + stamp shadow consistent everywhere. */

export default function Avatar({
  profile,
  size = 64,
  radius,
  background = "var(--t-accent)",
  shadow = true,
  className = "",
}) {
  const px = typeof size === "number" ? `${size}px` : size;
  const r  = radius ?? Math.round((typeof size === "number" ? size : 64) * 0.25);
  const emojiSize = typeof size === "number" ? Math.round(size * 0.55) : 32;

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden border-2 border-[#0F172A] ${className}`}
      style={{
        width: px,
        height: px,
        borderRadius: r,
        background: profile.avatarImage ? "transparent" : background,
        boxShadow: shadow ? "3px 3px 0 #0F172A" : undefined,
        lineHeight: 1,
      }}
    >
      {profile.avatarImage ? (
        <img
          src={profile.avatarImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: emojiSize }}>{profile.avatarEmoji}</span>
      )}
    </div>
  );
}
