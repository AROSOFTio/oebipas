export default function DetailGrid({ items }) {
  return (
    <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-hover)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--color-text)', fontWeight: '600' }}>Registered Account Identity</h3>
      </div>
      <div style={{ padding: '0 24px' }}>
        {items.map((item, index) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', padding: '16px 0', borderBottom: index < items.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
            <span style={{ minWidth: '180px', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.95rem' }}>
              {item.label}:
            </span>
            <strong style={{ color: 'var(--color-text)', fontSize: '0.95rem', fontWeight: '600', wordBreak: 'break-word', flex: 1 }}>
              {item.value || '-'}
            </strong>
          </div>
        ))}
      </div>
    </div>
  );
}
