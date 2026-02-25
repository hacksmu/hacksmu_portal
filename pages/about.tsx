import Head from 'next/head';
import Link from 'next/link';
import { useAuthContext } from '../lib/user/AuthContext';

const glass: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(100,160,255,0.09) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.26)',
  borderRadius: 20,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.32), 0 8px 32px rgba(0,20,60,0.28)',
};

const STATS = [
  { number: '24',    label: 'Hours of Hacking',   color: '#60c8ff' },
  { number: '500+',  label: 'Hackers Expected',    color: '#40ffb8' },
  { number: '$10K+', label: 'in Prizes',            color: '#ffd040' },
  { number: '50+',   label: 'Projects Built',       color: '#b080ff' },
];

const HIGHLIGHTS = [
  { emoji: '🏫', title: 'SMU Campus', desc: 'Hosted at Southern Methodist University in Dallas, TX — right in the heart of Uptown.' },
  { emoji: '⏱️', title: '24 Hours', desc: 'Non-stop hacking from Saturday morning through Sunday noon. Build something amazing overnight.' },
  { emoji: '🤝', title: 'All Skill Levels', desc: 'Whether you\'re a first-time hacker or a seasoned engineer, HackSMU welcomes everyone.' },
  { emoji: '🍕', title: 'Food & Swag', desc: 'Free meals, snacks, and exclusive HackSMU merch throughout the event.' },
  { emoji: '🎓', title: 'Workshops', desc: 'Learn from industry professionals and fellow hackers through hands-on technical workshops.' },
  { emoji: '🏆', title: 'Prizes', desc: 'Compete for $10K+ in prizes across multiple tracks and sponsor challenges.' },
];

export default function AboutPage() {
  const { isSignedIn } = useAuthContext();
  const registerHref = isSignedIn ? '/register' : '/auth';
  return (
    <>
      <Head>
        <title>About — HackSMU VII</title>
        <meta name="description" content="About HackSMU VII — April 11-12, 2026 · Dallas, TX" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px 80px' }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 38% 30%, rgba(255,255,255,0.50) 0%, rgba(0,160,255,0.45) 40%, rgba(0,60,200,0.70) 100%)',
            border: '2px solid rgba(0,200,255,0.50)',
            boxShadow: '0 0 32px rgba(0,180,255,0.35)',
            fontSize: 36,
            marginBottom: 20,
          }}>
            🏔️
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 'clamp(28px, 5vw, 48px)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 24px rgba(0,200,255,0.55)',
            letterSpacing: '0.04em',
            margin: '0 0 12px',
          }}>
            About HackSMU VII
          </h1>
          <p style={{ color: 'rgba(200,232,255,0.72)', fontSize: 18, maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            HackSMU is Southern Methodist University's premier hackathon — 24 hours of coding, creativity, and collaboration in the heart of Dallas.
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
          marginBottom: 48,
        }}>
          {STATS.map(({ number, label, color }) => (
            <div key={label} style={{ ...glass, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: 32,
                fontWeight: 900,
                color,
                textShadow: `0 0 16px ${color}80`,
                marginBottom: 6,
              }}>
                {number}
              </div>
              <div style={{ color: 'rgba(200,232,255,0.65)', fontSize: 13, fontWeight: 600 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* What to expect */}
        <div style={{ ...glass, padding: '32px 28px', marginBottom: 32 }}>
          <h2 style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 20,
            fontWeight: 800,
            color: '#e0f0ff',
            textShadow: '0 0 12px rgba(0,180,255,0.40)',
            letterSpacing: '0.05em',
            marginBottom: 16,
          }}>
            What is HackSMU?
          </h2>
          <p style={{ color: 'rgba(210,235,255,0.80)', fontSize: 15, lineHeight: 1.8, marginBottom: 16 }}>
            HackSMU is an annual hackathon organized by ACM @ SMU that brings together hundreds of students from universities across the country. Over 24 hours, participants form teams, dream up ideas, and build working projects from scratch — competing for prizes across multiple tracks.
          </p>
          <p style={{ color: 'rgba(210,235,255,0.80)', fontSize: 15, lineHeight: 1.8, margin: 0 }}>
            Whether you want to build a web app, hardware project, mobile game, or anything in between — HackSMU VII is your opportunity to turn an idea into reality, make friends, learn new skills, and have an unforgettable weekend.
          </p>
        </div>

        {/* Highlights grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: 16,
          marginBottom: 40,
        }}>
          {HIGHLIGHTS.map(({ emoji, title, desc }) => (
            <div key={title} style={{ ...glass, padding: '20px 18px' }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
              <div style={{
                color: '#e8f4ff', fontSize: 15, fontWeight: 700, marginBottom: 6,
                fontFamily: "'Orbitron', 'Roboto', sans-serif", letterSpacing: '0.02em',
              }}>
                {title}
              </div>
              <p style={{ color: 'rgba(200,228,255,0.70)', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
                {desc}
              </p>
            </div>
          ))}
        </div>

        {/* Event details */}
        <div style={{ ...glass, padding: '28px', marginBottom: 32 }}>
          <h2 style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 18, fontWeight: 800, color: '#e0f0ff',
            textShadow: '0 0 10px rgba(0,180,255,0.35)',
            letterSpacing: '0.05em', marginBottom: 18,
          }}>
            Event Details
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px 24px' }}>
            {[
              { label: 'Date', value: 'April 11-12, 2026', icon: '📅' },
              { label: 'Location', value: 'Hughes Trigg Student Center, SMU', icon: '📍' },
              { label: 'Format', value: 'In-Person', icon: '🏫' },
              { label: 'Team Size', value: '1–4 Hackers', icon: '👥' },
              { label: 'Cost', value: 'Free to Attend', icon: '🎫' },
              { label: 'Eligibility', value: 'All College Students', icon: '🎓' },
            ].map(({ label, value, icon }) => (
              <div key={label}>
                <div style={{ color: 'rgba(200,232,255,0.55)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>
                  {icon} {label}
                </div>
                <div style={{ color: '#e8f4ff', fontSize: 14, fontWeight: 600 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href={registerHref}>
            <a style={{
              position: 'relative', overflow: 'hidden',
              padding: '13px 40px', borderRadius: 28,
              background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.50) 0%, rgba(0,160,255,0.45) 40%, rgba(0,60,200,0.70) 100%)',
              border: '1px solid rgba(255,255,255,0.50)',
              color: '#fff', fontWeight: 800, fontSize: 15,
              letterSpacing: '0.06em', textDecoration: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.50), 0 4px 20px rgba(0,80,200,0.40)',
              display: 'inline-block',
            }}>
              Register Now
            </a>
          </Link>
          <Link href="/faq">
            <a style={{
              padding: '13px 32px', borderRadius: 28,
              background: 'rgba(255,255,255,0.10)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: 'rgba(200,232,255,0.90)', fontWeight: 700, fontSize: 15,
              letterSpacing: '0.04em', textDecoration: 'none',
              display: 'inline-block',
            }}>
              View FAQ
            </a>
          </Link>
        </div>
      </div>
    </>
  );
}
