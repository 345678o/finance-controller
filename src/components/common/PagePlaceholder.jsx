export default function PagePlaceholder({ title, subtitle }) {
  return (
    <section className="animate-fade-up">
      <div className="surface p-6">
        <p className="eyebrow">AuraLoop</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{subtitle}</p>
        )}
        <div className="divider mt-5" />
        <p className="mt-4 text-[12px] text-ink-dim">
          Screen scaffold — UI lands in the next step.
        </p>
      </div>
    </section>
  );
}
