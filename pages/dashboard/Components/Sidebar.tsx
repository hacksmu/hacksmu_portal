import React from 'react';
import Link from 'next/link';
import { useUser } from '../../../lib/profile/user-data';
import { useAuthContext } from '../../../lib/user/AuthContext';

const roleColors: Record<string, string> = {
  admin: '#ff8844',
  super_admin: '#ff4488',
  organizer: '#b080ff',
  sponsor: '#ffd040',
  judge: '#40ffb8',
  hacker: '#60c8ff',
};

const navLinks = [
  { label: 'Dashboard', path: '/dashboard', icon: '⚡' },
  { label: 'Schedule', path: '/schedule', icon: '📅' },
  { label: 'Profile', path: '/profile', icon: '👤' },
];

function Sidebar() {
  const { isSignedIn } = useAuthContext();
  const user = useUser();
  const role = user.permissions?.length > 0 ? user.permissions[0] : 'hacker';
  const roleColor = roleColors[role] ?? '#60c8ff';
  const displayName = !user || !isSignedIn ? 'Hacker' : user.firstName || 'Hacker';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <section className="hidden md:flex" style={{ width: 200, flexShrink: 0 }} />

      <section
        className="hidden md:flex"
        style={{
          position: 'fixed',
          top: 48,
          left: 0,
          width: 200,
          height: 'calc(100vh - 48px)',
          flexDirection: 'column',
          alignItems: 'stretch',
          padding: '24px 0',
          background: 'linear-gradient(180deg, rgba(5,25,70,0.92) 0%, rgba(3,40,80,0.88) 100%)',
          backdropFilter: 'blur(20px) saturate(160%)',
          WebkitBackdropFilter: 'blur(20px) saturate(160%)',
          borderRight: '1px solid rgba(255,255,255,0.14)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.40)',
          zIndex: 80,
          overflowY: 'auto',
        }}
      >
        {/* Avatar + name */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 24px', borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: `radial-gradient(circle at 38% 36%, rgba(255,255,255,0.45) 0%, ${roleColor}88 40%, ${roleColor}44 100%)`,
            border: `2px solid ${roleColor}88`,
            boxShadow: `0 0 18px ${roleColor}55, inset 0 1px 0 rgba(255,255,255,0.4)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron', sans-serif", fontWeight: 900, fontSize: 20,
            color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.5)',
            marginBottom: 10,
          }}>
            {initials}
          </div>
          <div style={{ fontFamily: "'Orbitron', 'Roboto', sans-serif", fontSize: 13, fontWeight: 800, color: '#e0f0ff', textAlign: 'center', letterSpacing: '0.04em' }}>
            {displayName}
          </div>
          <div style={{
            marginTop: 6, padding: '2px 10px', borderRadius: 10,
            background: `${roleColor}22`, border: `1px solid ${roleColor}55`,
            color: roleColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
          }}>
            {role.replace('_', ' ')}
          </div>
        </div>

        <nav style={{ padding: '16px 8px', flex: 1 }}>
          {navLinks.map((link) => (
            <Link key={link.label} href={link.path}>
              <a style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 14px', borderRadius: 10,
                color: 'rgba(200,232,255,0.82)', fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s', marginBottom: 4,
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(0,150,255,0.18)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'rgba(200,232,255,0.82)';
              }}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {link.label}
              </a>
            </Link>
          ))}
        </nav>

        <div style={{ padding: '16px 12px 0', borderTop: '1px solid rgba(255,255,255,0.10)' }}>
          <a href="https://hacksmu.org/discord" target="_blank" rel="noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '9px 12px', borderRadius: 10,
              background: 'rgba(88,101,242,0.18)', border: '1px solid rgba(88,101,242,0.35)',
              color: '#9ea8ff', fontSize: 12, fontWeight: 700, textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(88,101,242,0.30)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(88,101,242,0.18)'; }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.015.04.032.05a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 13.99 13.99 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.07 13.07 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" fill="#5865F2"/>
            </svg>
            Join Discord
          </a>
        </div>
      </section>
    </>
  );
}

export default Sidebar;
