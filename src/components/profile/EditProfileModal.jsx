import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ImagePlus, Trash2, X } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";

/* EditProfileModal — name, handle, email, avatar (image or emoji).
   Image uploads are downscaled to 320×320 JPEG before being stored as a
   base64 data URL, so localStorage stays small and decode is instant. */

const EMOJI_CHOICES = ["🌅", "🪐", "🌱", "🦋", "🍵", "✨", "🌊", "🔮", "🎧", "🍑", "📿", "🌸"];
const AVATAR_MAX_PX = 320;
const AVATAR_QUALITY = 0.85;

/** Read a File, downscale onto a square canvas, return a JPEG data URL. */
async function fileToDataUrl(file) {
  if (!file) return null;
  if (!file.type.startsWith("image/")) {
    throw new Error("That's not an image. Try a JPG, PNG, or WebP.");
  }
  const bitmap = await createImageBitmap(file);
  const minSide = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - minSide) / 2;
  const sy = (bitmap.height - minSide) / 2;
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_MAX_PX;
  canvas.height = AVATAR_MAX_PX;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, sx, sy, minSide, minSide, 0, 0, AVATAR_MAX_PX, AVATAR_MAX_PX);
  bitmap.close?.();
  return canvas.toDataURL("image/jpeg", AVATAR_QUALITY);
}

export default function EditProfileModal({ open, onClose }) {
  const profile = useAuraStore((s) => s.profile);
  const updateProfile = useAuraStore((s) => s.updateProfile);

  const [displayName, setDisplayName] = useState(profile.displayName);
  const [handle, setHandle] = useState(profile.handle);
  const [email, setEmail] = useState(profile.email);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatarEmoji);
  const [avatarImage, setAvatarImage] = useState(profile.avatarImage);
  const [uploadError, setUploadError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  // Re-seed inputs whenever the modal opens fresh.
  useEffect(() => {
    if (open) {
      setDisplayName(profile.displayName);
      setHandle(profile.handle);
      setEmail(profile.email);
      setAvatarEmoji(profile.avatarEmoji);
      setAvatarImage(profile.avatarImage);
      setUploadError(null);
      setUploading(false);
      setErrors({});
    }
  }, [open, profile]);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow picking the same file again
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setAvatarImage(dataUrl);
    } catch (err) {
      setUploadError(err.message || "Couldn't read that image.");
    } finally {
      setUploading(false);
    }
  }

  function clearImage() {
    setAvatarImage(null);
    setUploadError(null);
  }

  function validate() {
    const e = {};
    if (!displayName.trim()) e.displayName = "Pick something — even a vibe.";
    const cleanHandle = handle.trim().replace(/^@/, "");
    if (!/^[a-z0-9._]{2,24}$/i.test(cleanHandle)) {
      e.handle = "Letters, numbers, dot, underscore — 2 to 24 chars.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "That email's not quite right.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave(ev) {
    ev.preventDefault();
    if (!validate()) return;
    updateProfile({
      displayName: displayName.trim(),
      handle: handle.trim().replace(/^@/, ""),
      email: email.trim().toLowerCase(),
      avatarEmoji,
      avatarImage,
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[90] flex items-end justify-center bg-black/45 p-4 sm:items-center"
        >
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSave}
            initial={{ y: 50, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md space-y-4 rounded-3xl border-2 border-[#0F172A] bg-[var(--t-card)] p-5 shadow-[6px_6px_0_#0F172A]"
          >
            <header className="flex items-center justify-between">
              <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] text-[var(--t-ink-muted)]">
                Edit profile
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="grid h-9 w-9 place-items-center rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] shadow-[2px_2px_0_#0F172A] active:translate-y-[1px] active:shadow-none"
              >
                <X size={14} strokeWidth={2.6} />
              </button>
            </header>

            {/* Avatar preview + picker */}
            <div className="flex items-start gap-4">
              <div className="shrink-0">
                <div
                  className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl border-2 border-[#0F172A] text-[34px] shadow-[3px_3px_0_#0F172A]"
                  style={{
                    background: avatarImage ? "transparent" : "var(--t-accent)",
                  }}
                >
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>{avatarEmoji}</span>
                  )}
                </div>
                <div className="mt-2 flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex flex-1 items-center justify-center gap-1 rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] py-1.5 text-[10.5px] font-extrabold text-[#0F172A] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none disabled:opacity-60"
                  >
                    <ImagePlus size={11} strokeWidth={2.6} />
                    {uploading ? "…" : "Upload"}
                  </button>
                  {avatarImage && (
                    <button
                      type="button"
                      onClick={clearImage}
                      aria-label="Remove photo"
                      className="grid h-[26px] w-7 place-items-center rounded-xl border-2 border-[#0F172A] bg-[var(--t-card)] text-[#B91C1C] shadow-[2px_2px_0_#0F172A] transition-transform active:translate-y-[1px] active:shadow-none"
                    >
                      <Trash2 size={11} strokeWidth={2.6} />
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                {uploadError && (
                  <p className="mt-1.5 max-w-[140px] text-[10.5px] font-bold leading-tight text-[#B91C1C]">
                    {uploadError}
                  </p>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-[var(--t-ink-muted)]">
                  {avatarImage ? "Or pick an emoji" : "Pick your vibe"}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {EMOJI_CHOICES.map((e) => (
                    <button
                      type="button"
                      key={e}
                      onClick={() => {
                        setAvatarEmoji(e);
                        setAvatarImage(null); // emoji choice clears the image
                      }}
                      className={`h-9 w-9 rounded-xl border-2 border-[#0F172A] text-[16px] transition-transform active:translate-y-[1px] ${
                        !avatarImage && avatarEmoji === e
                          ? "bg-[var(--t-primary)] shadow-[2px_2px_0_#0F172A]"
                          : "bg-[var(--t-card)]"
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10.5px] leading-relaxed text-[var(--t-ink-faint)]">
                  Photos are downscaled to 320×320 and stored on this device only.
                </p>
              </div>
            </div>

            {/* Name */}
            <Field
              label="Display name"
              value={displayName}
              onChange={setDisplayName}
              error={errors.displayName}
              placeholder="Anamika"
              autoFocus
            />

            {/* Handle + email */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field
                label="Handle"
                value={handle}
                onChange={setHandle}
                error={errors.handle}
                placeholder="anamika.aura"
                prefix="@"
                autoCapitalize="off"
              />
              <Field
                label="Email"
                type="email"
                inputMode="email"
                value={email}
                onChange={setEmail}
                error={errors.email}
                placeholder="you@auraloop.app"
                autoCapitalize="off"
              />
            </div>

            {/* Save */}
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#0F172A] bg-[var(--t-primary)] py-3 text-[13.5px] font-extrabold text-[#0F172A] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
            >
              <Check size={14} strokeWidth={2.8} />
              Save changes
            </button>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  prefix,
  type = "text",
  inputMode,
  placeholder,
  autoFocus,
  autoCapitalize,
}) {
  return (
    <label className="block">
      <span className="block text-[11px] font-extrabold uppercase tracking-[0.14em] text-[var(--t-ink-muted)]">
        {label}
      </span>
      <div
        className="mt-1.5 flex items-center rounded-2xl border-2 border-[#0F172A] bg-[var(--t-bg)] px-3 focus-within:bg-[var(--t-card)]"
      >
        {prefix && (
          <span className="mr-1 text-[14px] font-extrabold text-[var(--t-ink-muted)]">
            {prefix}
          </span>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          className="w-full bg-transparent py-2.5 text-[14.5px] font-bold text-[var(--t-ink)] outline-none placeholder:text-[var(--t-ink-faint)]"
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[11.5px] font-bold text-[#B91C1C]">{error}</p>
      )}
    </label>
  );
}
