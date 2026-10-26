'use client';

export default function TeamCard({ member }) {
  if (!member) return null;

  const name = member.name || member.title || '';
  const role = member.role || member.badge || '';
  const bio = member.bio || member.description || '';
  const image = member.image || member.img || '';
  const fallback = member.fallbackImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

  return (
    <div
      style={{
        background: 'var(--color-bg-card)',
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
        textAlign: 'center',
        transition: 'all var(--transition-base)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      {/* Image slot passed via children or props */}
      <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image || fallback}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = fallback;
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 100%)' }} />
      </div>
      <div style={{ padding: 'var(--space-5)' }}>
        <h3 style={{ fontFamily: '"Italiana", sans-serif', fontWeight: 700, fontSize: 16, color: 'var(--color-text-primary)', marginBottom: 'var(--space-1)' }}>{name}</h3>
        <div style={{ color: 'var(--color-primary)', fontSize: 13, fontWeight: 600, marginBottom: 'var(--space-2)' }}>{role}</div>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{bio}</p>
      </div>
    </div>
  );
}
