export default function JsonPanel({ title, data }) {
  if (!data) {
    return null;
  }
  return (
    <div className="rounded-2xl bg-slate-950 p-4 text-sm text-slate-100 shadow-sm">
      {title ? <p className="mb-3 text-xs uppercase tracking-[0.2em] text-slate-400">{title}</p> : null}
      <pre className="overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
