export default function DetailGrid({ items }) {
  return (
    <div className="detail-grid">
      {items.map((item) => (
        <div key={item.label} className="detail-card">
          <span style={{ color: 'var(--color-text-muted)', marginRight: '6px' }}>{item.label}:</span>
          <strong>{item.value || '-'}</strong>
        </div>
      ))}
    </div>
  );
}
