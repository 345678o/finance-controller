import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import "./MagicBento.css";

/* AuraLoop's MagicBento — adapted from React Bits.
   Same interaction model (spotlight, border-glow, particles, tilt, magnetism,
   click ripple) but re-skinned to the cream/mustard neo-brutalist palette and
   wired to accept project-specific cardData with optional navigation links. */

const DEFAULT_PARTICLE_COUNT = 10;
const DEFAULT_SPOTLIGHT_RADIUS = 320;
const DEFAULT_GLOW_COLOR = "theme"; // resolved at runtime against --t-glow
const MOBILE_BREAKPOINT = 768;

function resolveGlow(glowColor) {
  if (glowColor && glowColor !== "theme") return glowColor;
  if (typeof window === "undefined") return "245, 200, 66";
  const v = getComputedStyle(document.documentElement)
    .getPropertyValue("--t-glow")
    .trim();
  return v || "245, 200, 66";
}

function useThemeGlow(passed) {
  const [val, setVal] = useState(() => resolveGlow(passed));
  useEffect(() => {
    if (passed && passed !== "theme") {
      setVal(passed);
      return;
    }
    const root = document.documentElement;
    const update = () => setVal(resolveGlow("theme"));
    update();
    const obs = new MutationObserver(update);
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, [passed]);
  return val;
}

const calcSpotlight = (radius) => ({
  proximity: radius * 0.5,
  fadeDistance: radius * 0.85,
});

function makeParticle(x, y, glow) {
  const el = document.createElement("div");
  el.className = "aura-bento-particle";
  el.style.cssText = `
    position: absolute;
    width: 5px;
    height: 5px;
    background: rgba(${glow}, 1);
    box-shadow: 0 0 8px rgba(${glow}, 0.55);
    left: ${x}px;
    top: ${y}px;
  `;
  return el;
}

function setCardGlow(card, mouseX, mouseY, intensity, radius) {
  const rect = card.getBoundingClientRect();
  const rx = ((mouseX - rect.left) / rect.width) * 100;
  const ry = ((mouseY - rect.top) / rect.height) * 100;
  card.style.setProperty("--glow-x", `${rx}%`);
  card.style.setProperty("--glow-y", `${ry}%`);
  card.style.setProperty("--glow-intensity", intensity.toString());
  card.style.setProperty("--glow-radius", `${radius}px`);
}

function useIsMobile() {
  const [m, setM] = useState(false);
  useEffect(() => {
    const check = () => setM(window.innerWidth <= MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  return m;
}

/* ─────────── ParticleCard wrapper (stars + tilt + magnetism + ripple) ─────────── */
function ParticleCard({
  card,
  navigate,
  textAutoHide,
  enableBorderGlow,
  disableAnimations,
  particleCount,
  glowColor,
  enableTilt,
  enableMagnetism,
  clickEffect,
}) {
  const ref = useRef(null);
  const livesRef = useRef([]);     // active particle DOM nodes
  const seedsRef = useRef([]);     // memoized particle seeds
  const timersRef = useRef([]);
  const isHover = useRef(false);
  const initialized = useRef(false);
  const magnetismTween = useRef(null);

  const initSeeds = useCallback(() => {
    if (initialized.current || !ref.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    seedsRef.current = Array.from({ length: particleCount }, () =>
      makeParticle(Math.random() * width, Math.random() * height, glowColor),
    );
    initialized.current = true;
  }, [particleCount, glowColor]);

  const clearParticles = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    magnetismTween.current?.kill();
    livesRef.current.forEach((p) => {
      gsap.to(p, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "back.in(1.7)",
        onComplete: () => p.parentNode?.removeChild(p),
      });
    });
    livesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!ref.current || !isHover.current) return;
    if (!initialized.current) initSeeds();

    seedsRef.current.forEach((seed, i) => {
      const t = setTimeout(() => {
        if (!isHover.current || !ref.current) return;
        const clone = seed.cloneNode(true);
        ref.current.appendChild(clone);
        livesRef.current.push(clone);

        gsap.fromTo(
          clone,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" },
        );
        gsap.to(clone, {
          x: (Math.random() - 0.5) * 80,
          y: (Math.random() - 0.5) * 80,
          rotation: Math.random() * 360,
          duration: 2 + Math.random() * 2,
          ease: "none",
          repeat: -1,
          yoyo: true,
        });
        gsap.to(clone, {
          opacity: 0.35,
          duration: 1.5,
          ease: "power2.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, i * 90);
      timersRef.current.push(t);
    });
  }, [initSeeds]);

  useEffect(() => {
    if (disableAnimations || !ref.current) return;
    const el = ref.current;

    const onEnter = () => {
      isHover.current = true;
      animateParticles();
      if (enableTilt) {
        gsap.to(el, {
          rotateX: 4,
          rotateY: 4,
          duration: 0.3,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
    };

    const onLeave = () => {
      isHover.current = false;
      clearParticles();
      if (enableTilt) {
        gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3, ease: "power2.out" });
      }
      if (enableMagnetism) {
        gsap.to(el, { x: 0, y: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    const onMove = (e) => {
      if (!enableTilt && !enableMagnetism) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -7,
          rotateY: ((x - cx) / cx) * 7,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        magnetismTween.current = gsap.to(el, {
          x: (x - cx) * 0.04,
          y: (y - cy) * 0.04,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };

    const onClick = (e) => {
      if (clickEffect) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maxDist = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        );
        const ripple = document.createElement("div");
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDist * 2}px;
          height: ${maxDist * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.35) 0%, rgba(${glowColor}, 0.18) 35%, transparent 70%);
          left: ${x - maxDist}px;
          top: ${y - maxDist}px;
          pointer-events: none;
          z-index: 4;
        `;
        el.appendChild(ripple);
        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            onComplete: () => ripple.remove(),
          },
        );
      }
      if (card.to) {
        // Defer so the ripple has a beat to start.
        setTimeout(() => navigate(card.to), 120);
      }
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("click", onClick);
    return () => {
      isHover.current = false;
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("click", onClick);
      clearParticles();
    };
  }, [
    animateParticles,
    clearParticles,
    disableAnimations,
    enableTilt,
    enableMagnetism,
    clickEffect,
    glowColor,
    card.to,
    navigate,
  ]);

  const Icon = card.Icon;
  return (
    <div
      ref={ref}
      role={card.to ? "link" : undefined}
      tabIndex={card.to ? 0 : undefined}
      className={[
        "aura-bento-card",
        textAutoHide && "aura-bento-card--text-autohide",
        enableBorderGlow && "aura-bento-card--border-glow",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="aura-bento-card__header">
        {Icon && (
          <span className="aura-bento-card__icon" style={{ background: card.tint }}>
            <Icon size={17} strokeWidth={2.4} />
          </span>
        )}
        <span className="aura-bento-card__label">{card.label}</span>
      </div>
      <div className="aura-bento-card__content">
        {card.value !== undefined && (
          <p className="aura-bento-card__value">{card.value}</p>
        )}
        <h3 className="aura-bento-card__title">{card.title}</h3>
        <p className="aura-bento-card__description">{card.description}</p>
      </div>
    </div>
  );
}

/* ─────────── Global spotlight (cursor-tracked halo) ─────────── */
function GlobalSpotlight({ gridRef, disabled, radius, glowColor }) {
  const spotRef = useRef(null);

  useEffect(() => {
    if (disabled || !gridRef?.current) return;

    const spot = document.createElement("div");
    spot.className = "aura-bento-spotlight";
    spot.style.setProperty("--bento-glow-rgb", glowColor);
    document.body.appendChild(spot);
    spotRef.current = spot;

    const onMove = (e) => {
      if (!spotRef.current || !gridRef.current) return;
      const section = gridRef.current;
      const rect = section.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      const cards = section.querySelectorAll(".aura-bento-card");

      if (!inside) {
        gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
        cards.forEach((c) => c.style.setProperty("--glow-intensity", "0"));
        return;
      }

      const { proximity, fadeDistance } = calcSpotlight(radius);
      let minDist = Infinity;
      cards.forEach((card) => {
        const r = card.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dRaw =
          Math.hypot(e.clientX - cx, e.clientY - cy) - Math.max(r.width, r.height) / 2;
        const d = Math.max(0, dRaw);
        minDist = Math.min(minDist, d);
        let intensity = 0;
        if (d <= proximity) intensity = 1;
        else if (d <= fadeDistance)
          intensity = (fadeDistance - d) / (fadeDistance - proximity);
        setCardGlow(card, e.clientX, e.clientY, intensity, radius);
      });

      gsap.to(spotRef.current, {
        left: e.clientX,
        top: e.clientY,
        duration: 0.1,
        ease: "power2.out",
      });
      const targetOpacity =
        minDist <= proximity
          ? 0.85
          : minDist <= fadeDistance
            ? ((fadeDistance - minDist) / (fadeDistance - proximity)) * 0.85
            : 0;
      gsap.to(spotRef.current, {
        opacity: targetOpacity,
        duration: targetOpacity > 0 ? 0.18 : 0.45,
        ease: "power2.out",
      });
    };

    const onLeave = () => {
      gridRef.current?.querySelectorAll(".aura-bento-card").forEach((c) =>
        c.style.setProperty("--glow-intensity", "0"),
      );
      if (spotRef.current) {
        gsap.to(spotRef.current, { opacity: 0, duration: 0.3, ease: "power2.out" });
      }
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      spotRef.current?.parentNode?.removeChild(spotRef.current);
    };
  }, [gridRef, disabled, radius, glowColor]);

  return null;
}

/* ─────────── Plain (no-stars) card variant ─────────── */
function PlainCard({
  card,
  navigate,
  textAutoHide,
  enableBorderGlow,
  disableAnimations,
  glowColor,
  enableTilt,
  enableMagnetism,
  clickEffect,
}) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || disableAnimations) return;
    const onMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      if (enableTilt) {
        gsap.to(el, {
          rotateX: ((y - cy) / cy) * -7,
          rotateY: ((x - cx) / cx) * 7,
          duration: 0.1,
          ease: "power2.out",
          transformPerspective: 1000,
        });
      }
      if (enableMagnetism) {
        gsap.to(el, {
          x: (x - cx) * 0.04,
          y: (y - cy) * 0.04,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    };
    const onLeave = () => {
      if (enableTilt) gsap.to(el, { rotateX: 0, rotateY: 0, duration: 0.3 });
      if (enableMagnetism) gsap.to(el, { x: 0, y: 0, duration: 0.3 });
    };
    const onClick = (e) => {
      if (clickEffect) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const maxDist = Math.max(
          Math.hypot(x, y),
          Math.hypot(x - rect.width, y),
          Math.hypot(x, y - rect.height),
          Math.hypot(x - rect.width, y - rect.height),
        );
        const ripple = document.createElement("div");
        ripple.style.cssText = `
          position: absolute;
          width: ${maxDist * 2}px;
          height: ${maxDist * 2}px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(${glowColor}, 0.35) 0%, rgba(${glowColor}, 0.18) 35%, transparent 70%);
          left: ${x - maxDist}px;
          top: ${y - maxDist}px;
          pointer-events: none;
          z-index: 4;
        `;
        el.appendChild(ripple);
        gsap.fromTo(
          ripple,
          { scale: 0, opacity: 1 },
          {
            scale: 1,
            opacity: 0,
            duration: 0.7,
            ease: "power2.out",
            onComplete: () => ripple.remove(),
          },
        );
      }
      if (card.to) setTimeout(() => navigate(card.to), 120);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("click", onClick);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("click", onClick);
    };
  }, [card.to, clickEffect, disableAnimations, enableTilt, enableMagnetism, glowColor, navigate]);

  const Icon = card.Icon;
  return (
    <div
      ref={ref}
      className={[
        "aura-bento-card",
        textAutoHide && "aura-bento-card--text-autohide",
        enableBorderGlow && "aura-bento-card--border-glow",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="aura-bento-card__header">
        {Icon && (
          <span className="aura-bento-card__icon" style={{ background: card.tint }}>
            <Icon size={17} strokeWidth={2.4} />
          </span>
        )}
        <span className="aura-bento-card__label">{card.label}</span>
      </div>
      <div className="aura-bento-card__content">
        {card.value !== undefined && (
          <p className="aura-bento-card__value">{card.value}</p>
        )}
        <h3 className="aura-bento-card__title">{card.title}</h3>
        <p className="aura-bento-card__description">{card.description}</p>
      </div>
    </div>
  );
}

/* ─────────── Public component ─────────── */
export default function MagicBento({
  cards,
  textAutoHide = true,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  disableAnimations = false,
  spotlightRadius = DEFAULT_SPOTLIGHT_RADIUS,
  particleCount = DEFAULT_PARTICLE_COUNT,
  enableTilt = false,
  glowColor = DEFAULT_GLOW_COLOR,
  clickEffect = true,
  enableMagnetism = true,
}) {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const isMobile = useIsMobile();
  const off = disableAnimations || isMobile;
  const liveGlow = useThemeGlow(glowColor);

  if (!cards?.length) return null;

  return (
    <>
      {enableSpotlight && (
        <GlobalSpotlight
          gridRef={gridRef}
          disabled={off}
          radius={spotlightRadius}
          glowColor={liveGlow}
        />
      )}
      <div
        ref={gridRef}
        className="aura-bento"
        style={{ "--bento-glow-rgb": liveGlow }}
      >
        {cards.map((card, i) => {
          const props = {
            card,
            navigate,
            textAutoHide,
            enableBorderGlow,
            disableAnimations: off,
            glowColor,
            enableTilt,
            enableMagnetism,
            clickEffect,
          };
          return enableStars ? (
            <ParticleCard
              key={card.key || i}
              {...props}
              glowColor={liveGlow}
              particleCount={particleCount}
            />
          ) : (
            <PlainCard key={card.key || i} {...props} glowColor={liveGlow} />
          );
        })}
      </div>
    </>
  );
}
