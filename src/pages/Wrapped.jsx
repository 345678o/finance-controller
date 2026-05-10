import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, Download, Loader2, Share2 } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { useAuraStore } from "@/store/useAuraStore";
import {
  computeWeeklyStory,
  format12h,
} from "@/utils/wrapped";
import { inr } from "@/utils/format";

import StoryCard from "@/components/wrapped/StoryCard";
import SplitText from "@/components/effects/SplitText";
import BlurText  from "@/components/effects/BlurText";

/* Photos served from /public/wrapped/ — same-origin so html-to-image can
   include them in the share screenshot without canvas-tainting. Originally
   sourced from loremflickr (CC-licensed Flickr photos), now bundled. */
const IMAGES = {
  food:     "/wrapped/food.jpg",
  hour:     "/wrapped/hour.jpg",
  merchant: "/wrapped/merchant.jpg",
  impulse:  "/wrapped/impulse.jpg",
  streak:   "/wrapped/streak.jpg",
  saved:    "/wrapped/saved.jpg",
};

export default function Wrapped() {
  const navigate     = useNavigate();
  const transactions = useAuraStore((s) => s.transactions);
  const streak       = useAuraStore((s) => s.streak);

  const story  = useMemo(() => computeWeeklyStory(transactions, streak), [transactions, streak]);

  const danger = format12h(story.dangerHour, story.dangerMinute);

  const captureRef = useRef(null);
  const [shareState, setShareState] = useState("idle"); // idle | preparing | shared | downloaded | failed

  const handleShare = async () => {
    if (shareState === "preparing") return;
    setShareState("preparing");
    const text = `My AuraLoop week: ${inr(story.totalSaved)} saved · ${story.streak}-day streak${story.topMerchant?.name ? ` · ${story.topMerchant.name} was my top merchant` : ""}.`;
    try {
      const node = captureRef.current;
      if (!node) throw new Error("Nothing to capture yet.");

      // Render the wrap section to a PNG blob. Photos live in /public/wrapped
      // so they're same-origin — no canvas-taint risk, includes them cleanly.
      const blob = await htmlToImage.toBlob(node, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue("--t-bg")
          .trim() || "#F5F1E8",
      });
      if (!blob) throw new Error("Could not generate image.");

      const file = new File([blob], "auraloop-wrap.png", { type: "image/png" });

      // Prefer native share with file. iOS 15+ and Android Chrome support it.
      if (navigator.canShare?.({ files: [file] }) && navigator.share) {
        await navigator.share({
          title: "AuraLoop · this week's wrap",
          text,
          files: [file],
        });
        setShareState("shared");
      } else {
        // Desktop / fallback — save the PNG locally so they can post it.
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "auraloop-wrap.png";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        // Also stash the caption for them to paste with the image.
        if (navigator.clipboard) {
          try { await navigator.clipboard.writeText(text); } catch { /* ignored */ }
        }
        setShareState("downloaded");
      }
    } catch (e) {
      // AbortError = user dismissed the native sheet, treat as harmless.
      if (e?.name === "AbortError") {
        setShareState("idle");
        return;
      }
      console.error("[wrap-share]", e);
      setShareState("failed");
    } finally {
      setTimeout(() => setShareState((s) => (s === "preparing" ? "idle" : s)), 200);
      setTimeout(() => setShareState("idle"), 2400);
    }
  };

  const sharing = shareState === "preparing";

  return (
    <>
      <div className="fixed inset-0 bg-[var(--t-bg)]" aria-hidden />

      <div className="relative space-y-5 pb-2">
        {/* Top bar — back · title · share */}
        <motion.header
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="flex items-center justify-between"
        >
          <button
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-[var(--t-primary)] shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            <ArrowLeft size={20} strokeWidth={2.6} className="text-[#0F172A]" />
          </button>

          <h1 className="text-[15px] font-extrabold tracking-tight text-[#0F172A]">
            Aura Wrapped
          </h1>

          <button
            onClick={handleShare}
            disabled={sharing}
            aria-label="Share"
            className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-[#0F172A] bg-white shadow-[3px_3px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-none disabled:opacity-70"
          >
            {sharing ? (
              <Loader2 size={18} strokeWidth={2.4} className="animate-spin text-[#0F172A]" />
            ) : shareState === "shared" || shareState === "downloaded" ? (
              <Check size={18} strokeWidth={3} className="text-[#0F172A]" />
            ) : (
              <Share2 size={18} strokeWidth={2.4} className="text-[#0F172A]" />
            )}
          </button>
        </motion.header>

        {/* Capture target — everything inside this wrapper is what gets
            screenshot when the user shares. Header and closing CTA stay
            outside so the share image doesn't include UI buttons. */}
        <div ref={captureRef} className="space-y-5">

        {/* Hero — episodic title block */}
        <section className="pt-2">
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-center text-[11px] font-extrabold uppercase tracking-[0.22em] text-[#475569]"
          >
            Week {weekOfYear()} · {new Date().getFullYear()}
          </motion.p>
          <h2 className="mt-3 text-center text-[30px] md:text-[42px] font-extrabold leading-[1.05] tracking-tight text-[#0F172A]">
            <SplitText delay={0.15} stagger={0.05}>Your Money,</SplitText>
            <br />
            <span
              className="inline-block rounded-2xl border-2 px-3 py-0.5"
              style={{
                borderColor: "#0F172A",
                background: "var(--t-primary)",
                boxShadow: "4px 4px 0 #0F172A",
              }}
            >
              <SplitText delay={0.55} stagger={0.05}>this week.</SplitText>
            </span>
          </h2>
          <p className="mt-3 text-center text-[13px] leading-relaxed text-[#475569]">
            <BlurText delay={0.95}>
              A short film about your spends, savings, and the moments that
              quietly shaped both.
            </BlurText>
          </p>
        </section>

        {/* Story stack */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <StoryCard
            label="Food delivery"
            imageUrl={IMAGES.food}
            imageAlt="Food delivery"
            bigValue={inr(story.foodSpend)}
            caption="Spent on cravings ordered to your door. The kitchen quietly missed you."
            accent="var(--t-primary)"
            delay={0.05}
          />

          <StoryCard
            label="Most spendy hour"
            imageUrl={IMAGES.hour}
            imageAlt="Late night neon"
            bigValue={danger.time}
            bigSuffix={danger.period}
            caption="Your wallet's least disciplined moment. Hint: the world is calmer at this hour, your money less so."
            accent="var(--t-lilac)"
            delay={0.1}
            splitBig={false}
          />

          <StoryCard
            label="Top merchant"
            imageUrl={IMAGES.merchant}
            imageAlt="Restaurant delivery"
            bigValue={story.topMerchant.name}
            caption={`${story.topMerchant.count} order${story.topMerchant.count === 1 ? "" : "s"} this week. They know your name.`}
            accent="var(--t-secondary)"
            delay={0.15}
            splitBig={false}
          />

          <StoryCard
            label="Impulse buys"
            imageUrl={IMAGES.impulse}
            imageAlt="Shopping bags"
            bigValue={inr(story.impulseSpend)}
            caption={`That's ${story.impulsePct}% of your week. Future you is taking notes.`}
            accent="var(--t-accent)"
            delay={0.2}
          />

          <StoryCard
            label="Saving streak"
            imageUrl={IMAGES.streak}
            imageAlt="Sparkler celebration"
            bigValue={String(story.streak)}
            bigSuffix="days"
            caption="Round-ups, every single day. Compound interest is taking notes too."
            accent="var(--t-secondary)"
            delay={0.25}
          />

          <StoryCard
            label="Total saved"
            imageUrl={IMAGES.saved}
            imageAlt="Coins in a jar"
            bigValue={inr(story.totalSaved)}
            caption="Stacked quietly while you spent loudly. This is the part future you reads first."
            accent="var(--t-primary)"
            delay={0.3}
          />
        </div>

        </div>{/* /capture target */}

        {/* Closing card — share */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden rounded-3xl border-2 border-[#0F172A] bg-white p-5 shadow-[5px_5px_0_#0F172A]"
        >
          <p className="text-[10.5px] font-extrabold uppercase tracking-[0.2em] text-[#475569]">
            That's a wrap
          </p>
          <h3 className="mt-1 text-[22px] font-extrabold leading-tight text-[#0F172A]">
            Send it to a friend who'd <em className="not-italic" style={{ background: "var(--t-primary)", padding: "0 6px", borderRadius: 6 }}>get it</em>.
          </h3>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-[#0F172A] bg-[var(--t-primary)] py-3.5 text-[14px] font-extrabold text-[#0F172A] shadow-[4px_4px_0_#0F172A] transition-transform active:translate-y-[2px] active:shadow-[2px_2px_0_#0F172A] disabled:opacity-80"
          >
            {sharing ? (
              <>
                <Loader2 size={14} strokeWidth={2.6} className="animate-spin" />
                Preparing image…
              </>
            ) : shareState === "shared" ? (
              <>
                <Check size={14} strokeWidth={3} />
                Shared
              </>
            ) : shareState === "downloaded" ? (
              <>
                <Download size={14} strokeWidth={2.6} />
                Saved · caption copied
              </>
            ) : shareState === "failed" ? (
              "Share failed — try again"
            ) : (
              <>
                <Share2 size={14} strokeWidth={2.4} />
                Share your wrap
              </>
            )}
          </button>
        </motion.section>
      </div>
    </>
  );
}

function weekOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start) / 86400000;
  return Math.ceil((diff + start.getDay() + 1) / 7);
}
