import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';

const navItems = [
  { label: 'HackCenter', path: '/dashboard' },
  { label: 'Ask a Question', path: '/dashboard/questions' },
];

export default function DashboardHeader() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Desktop pill nav */}
      <div
        className="hidden md:flex"
        style={{ justifyContent: 'center', gap: 8, padding: '10px 0' }}
      >
        {navItems.map((item) => {
          const active = router.pathname === item.path;
          return (
            <Link key={item.path} href={item.path}>
              <a
                style={{
                  padding: '7px 22px',
                  borderRadius: 24,
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textDecoration: 'none',
                  transition: 'all 0.22s',
                  background: active
                    ? 'linear-gradient(135deg, rgba(0,160,255,0.55) 0%, rgba(0,80,200,0.45) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(100,160,255,0.07) 100%)',
                  border: active
                    ? '1px solid rgba(0,180,255,0.60)'
                    : '1px solid rgba(255,255,255,0.20)',
                  color: active ? '#fff' : 'rgba(200,232,255,0.82)',
                  boxShadow: active
                    ? 'inset 0 1px 0 rgba(255,255,255,0.30), 0 2px 12px rgba(0,100,255,0.30)'
                    : 'none',
                }}
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.14)';
                    (e.currentTarget as HTMLElement).style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(100,160,255,0.07) 100%)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(200,232,255,0.82)';
                  }
                }}
              >
                {item.label}
              </a>
            </Link>
          );
        })}
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '10px 16px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(80,140,255,0.08) 100%)',
            border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(200,232,255,0.88)',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          Dashboard Menu
          <span style={{ transition: 'transform 0.2s', transform: mobileOpen ? 'rotate(180deg)' : 'none', opacity: 0.6 }}>▾</span>
        </button>
        {mobileOpen && (
          <div style={{
            marginTop: 4,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(5,20,60,0.85)',
          }}>
            {navItems.map((item) => {
              const active = router.pathname === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <a
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'block',
                      padding: '11px 18px',
                      color: active ? '#fff' : 'rgba(200,232,255,0.80)',
                      fontWeight: active ? 700 : 500,
                      fontSize: 13,
                      textDecoration: 'none',
                      background: active ? 'rgba(0,120,255,0.22)' : 'transparent',
                      borderBottom: '1px solid rgba(255,255,255,0.08)',
                      transition: 'background 0.15s',
                    }}
                  >
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
