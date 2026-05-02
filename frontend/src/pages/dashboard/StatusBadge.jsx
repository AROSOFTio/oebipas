const statusStyles = {
  paid: 'bg-emerald-100 text-emerald-700',
  successful: 'bg-emerald-100 text-emerald-700',
  unpaid: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  partially_paid: 'bg-amber-100 text-amber-700',
  overdue: 'bg-rose-100 text-rose-700',
  failed: 'bg-rose-100 text-rose-700',
};

export default function StatusBadge({ status }) {
  const normalizedStatus = String(status || 'pending').toLowerCase();
  const label = normalizedStatus.replace('_', ' ');

  return (
    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold capitalize tracking-wide ${statusStyles[normalizedStatus] || statusStyles.pending}`}>
      {label}
    </span>
  );
}
