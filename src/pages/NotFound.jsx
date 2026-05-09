import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60svh] grid place-items-center px-6 text-center">
      <div className="glass-card aura-bg p-8 max-w-sm w-full">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-muted">404</p>
        <h1 className="mt-2 text-2xl font-bold text-aura">Off the loop</h1>
        <p className="mt-3 text-sm text-ink-muted">
          That route doesn't exist yet — your aura's still intact though.
        </p>
        <Link to="/" className="btn-neon mt-6">Take me home</Link>
      </div>
    </div>
  );
}
