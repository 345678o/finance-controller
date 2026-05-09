export default function PagePlaceholder({ title, subtitle, accent = "green" }) {
  const ring = {
    green: "shadow-glow-green",
    pink:  "shadow-glow-pink",
    cyan:  "shadow-glow-cyan",
  }[accent];

  return (
    <section className="animate-fade-up">
      <div className={`glass-card aura-bg p-6 ${ring}`}>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-muted">AuraLoop</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight">
          <span className="text-aura">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-3 text-ink-muted text-sm leading-relaxed">{subtitle}</p>
        )}
        <div className="hairline mt-5" />
        <p className="mt-4 text-xs text-ink-dim">
          Screen scaffold — UI lands in the next step.
        </p>
      </div>
    </section>
  );
}
