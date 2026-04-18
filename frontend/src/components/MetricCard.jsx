export default function MetricCard({ title, value, note, tone = 'light' }) {
  const toneClass =
    tone === 'strong'
      ? 'border-transparent bg-[var(--panel-strong)] text-white'
      : tone === 'accent'
        ? 'border-transparent bg-[var(--accent-soft)] text-slate-900'
        : 'border-slate-200 bg-white text-slate-900';

  return (
    <div className={`rounded-[2rem] border p-5 shadow-soft ${toneClass}`}>
      <p className={`text-sm font-medium ${tone === 'strong' ? 'text-slate-100' : 'text-slate-500'}`}>{title}</p>
      <p className={`mt-4 text-3xl font-semibold ${tone === 'strong' ? 'text-white' : 'text-slate-900'}`}>{value}</p>
      {note ? <p className={`mt-2 text-xs ${tone === 'strong' ? 'text-slate-200' : 'text-slate-500'}`}>{note}</p> : null}
    </div>
  );
}
