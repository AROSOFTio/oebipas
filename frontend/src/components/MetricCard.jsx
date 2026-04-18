export default function MetricCard({ title, value, note }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      {note ? <p className="mt-2 text-xs text-slate-500">{note}</p> : null}
    </div>
  );
}
