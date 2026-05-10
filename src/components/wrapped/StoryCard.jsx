import { useState } from "react";
import { motion } from "framer-motion";
import SplitText from "@/components/effects/SplitText";

/* WrappedStoryCard
   Full-width hero card for the redesigned Wrapped page. Photo at top with a
   gradient overlay so text stays legible, then label / big stat / caption
   stacked below. Falls back to a colored gradient if the image fails. */

export default function StoryCard({
  imageUrl,
  imageAlt,
  label,
  bigValue,
  bigSuffix,
  caption,
  accent = "var(--t-primary)",
  bigColor = "#0F172A",
  delay = 0,
  splitBig = true,
}) {
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden rounded-3xl border-2 border-[#0F172A] bg-white shadow-[5px_5px_0_#0F172A]"
    >
      {/* Hero image */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          aspectRatio: "16 / 10",
          background: imgFailed
            ? `linear-gradient(135deg, ${accent} 0%, var(--t-card-soft) 100%)`
            : "var(--t-bg)",
        }}
      >
        {!imgFailed && (
          <motion.img
            src={imageUrl}
            alt={imageAlt}
            loading="lazy"
            decoding="async"
            initial={{ scale: 1.06, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            onError={() => setImgFailed(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* gradient legibility overlay along the bottom */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)",
          }}
        />
        {/* tag chip pinned to top-left of the photo */}
        <span
          className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border-2 border-[#0F172A] px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#0F172A]"
          style={{
            background: accent,
            boxShadow: "2px 2px 0 #0F172A",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]" />
          {label}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 pb-5 pt-4">
        <p
          className="num text-[40px] font-extrabold leading-none tracking-tight"
          style={{ color: bigColor }}
        >
          {splitBig ? (
            <SplitText delay={delay + 0.25} stagger={0.04}>
              {String(bigValue)}
            </SplitText>
          ) : (
            <span>{bigValue}</span>
          )}
          {bigSuffix && (
            <span
              className="ml-1 text-[18px] font-extrabold align-baseline"
              style={{ color: bigColor }}
            >
              {bigSuffix}
            </span>
          )}
        </p>

        {caption && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: delay + 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-[13.5px] leading-relaxed text-[#475569]"
          >
            {caption}
          </motion.p>
        )}
      </div>
    </motion.article>
  );
}
