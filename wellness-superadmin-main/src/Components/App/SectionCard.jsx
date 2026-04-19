export default function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
      {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      <div className={title || subtitle ? "mt-4" : ""}>{children}</div>
    </section>
  );
}
