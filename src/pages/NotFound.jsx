import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60svh] grid place-items-center px-6 text-center">
      <div className="surface w-full max-w-sm p-8">
        <p className="eyebrow">404</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
          Off the loop
        </h1>
        <p className="mt-2 text-[14px] text-ink-muted">
          That route doesn't exist yet — your aura's still intact though.
        </p>
        <Link to="/" className="btn-primary mt-6">Take me home</Link>
      </div>
    </div>
  );
}
