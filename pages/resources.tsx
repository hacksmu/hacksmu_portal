import Head from 'next/head';

const glass: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(255,255,255,0.13) 0%, rgba(100,160,255,0.07) 100%)',
  backdropFilter: 'blur(18px) saturate(180%)',
  WebkitBackdropFilter: 'blur(18px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.22)',
  borderRadius: 18,
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,20,60,0.30)',
};

type Resource = {
  label: string;
  href: string;
  emoji: string;
  desc: string;
  tag?: string;
  tagColor?: string;
};

type Category = {
  title: string;
  icon: string;
  accent: string;
  resources: Resource[];
};

const CATEGORIES: Category[] = [
  {
    title: 'Competition',
    icon: '🏆',
    accent: '#ffd040',
    resources: [
      {
        label: 'Devpost',
        href: 'https://hacksmu.devpost.com',
        emoji: '🚀',
        desc: 'Submit your project and browse other teams\' submissions. Required for judging.',
        tag: 'Required',
        tagColor: '#ff6060',
      },
      {
        label: 'MLH',
        href: 'https://mlh.io',
        emoji: '🎖️',
        desc: 'Major League Hacking — the official student hackathon league. Check rules and code of conduct.',
        tag: 'Rules',
        tagColor: '#40ffb8',
      },
    ],
  },
  {
    title: 'Community',
    icon: '💬',
    accent: '#b080ff',
    resources: [
      {
        label: 'Discord',
        href: 'https://discord.gg/hacksmu',
        emoji: '💬',
        desc: 'The main hub during the event. Announcements, help channels, team-finding, and more.',
        tag: 'Live Event',
        tagColor: '#60c8ff',
      },
      {
        label: 'GitHub — ACM@SMU',
        href: 'https://github.com/acm-smu',
        emoji: '🐙',
        desc: 'Open-source repos from ACM at SMU including this very portal. Fork, star, or contribute.',
      },
    ],
  },
  {
    title: 'Hacker Toolkit',
    icon: '🛠️',
    accent: '#40ffb8',
    resources: [
      {
        label: 'Notion — Hacker Hub',
        href: 'https://notion.so',
        emoji: '📓',
        desc: 'Our curated Notion workspace with API guides, workshop notes, prize tracks, and mentorship info.',
        tag: 'Must Read',
        tagColor: '#ffd040',
      },
      {
        label: 'Slides & Templates',
        href: '#',
        emoji: '📊',
        desc: 'Pitch deck templates and presentation slides to help you demo your project to judges.',
      },
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Code of Conduct', href: 'https://mlh.io/code-of-conduct', emoji: '📋' },
  { label: 'Devpost FAQ', href: 'https://help.devpost.com', emoji: '❓' },
  { label: 'GitHub Student Pack', href: 'https://education.github.com/pack', emoji: '🎒' },
  { label: 'Vercel Deploy', href: 'https://vercel.com', emoji: '▲' },
];

export default function ResourcesPage() {
  return (
    <>
      <Head>
        <title>Resources — HackSMU VII</title>
        <meta name="description" content="Hacker resources for HackSMU VII — tools, links, and everything you need to build." />
      </Head>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 24px 100px' }}>

        {/* ── Hero ── */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse at 38% 30%, rgba(255,255,255,0.50) 0%, rgba(0,160,255,0.45) 40%, rgba(0,60,200,0.70) 100%)',
            border: '2px solid rgba(0,200,255,0.50)',
            boxShadow: '0 0 40px rgba(0,180,255,0.40)',
            fontSize: 36,
            marginBottom: 22,
          }}>
            🔗
          </div>
          <h1 style={{
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            fontSize: 'clamp(26px, 5vw, 46px)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 28px rgba(0,200,255,0.55)',
            letterSpacing: '0.04em',
            margin: '0 0 14px',
          }}>
            Hacker Resources
          </h1>
          <p style={{
            color: 'rgba(200,232,255,0.72)',
            fontSize: 17,
            maxWidth: 520,
            margin: '0 auto',
            lineHeight: 1.75,
          }}>
            Everything you need to build, ship, and demo at HackSMU VII — in one place.
          </p>
        </div>

        {/* ── Category sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {CATEGORIES.map(cat => (
            <section key={cat.title}>
              {/* Section header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 16,
              }}>
                <span style={{ fontSize: 20 }}>{cat.icon}</span>
                <h2 style={{
                  margin: 0,
                  fontFamily: "'Orbitron', 'Roboto', sans-serif",
                  fontSize: 13,
                  fontWeight: 800,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: cat.accent,
                  textShadow: `0 0 12px ${cat.accent}80`,
                }}>
                  {cat.title}
                </h2>
                <div style={{
                  flex: 1,
                  height: 1,
                  background: `linear-gradient(to right, ${cat.accent}60, transparent)`,
                  marginLeft: 8,
                }} />
              </div>

              {/* Cards */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: 16,
              }}>
                {cat.resources.map(r => (
                  <a
                    key={r.label}
                    href={r.href}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      ...glass,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 18,
                      padding: '22px 24px',
                      textDecoration: 'none',
                      transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        `inset 0 1px 0 rgba(255,255,255,0.35), 0 12px 40px rgba(0,40,100,0.45), 0 0 0 1px ${cat.accent}40`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                        'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,20,60,0.30)';
                    }}
                  >
                    {/* Emoji orb */}
                    <div style={{
                      flexShrink: 0,
                      width: 52, height: 52,
                      borderRadius: '50%',
                      background: 'radial-gradient(ellipse at 38% 30%, rgba(255,255,255,0.45) 0%, rgba(0,120,220,0.35) 50%, rgba(0,40,140,0.65) 100%)',
                      border: `1.5px solid ${cat.accent}60`,
                      boxShadow: `0 0 16px ${cat.accent}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 24,
                    }}>
                      {r.emoji}
                    </div>

                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 6,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{
                          fontFamily: "'Orbitron', 'Roboto', sans-serif",
                          fontSize: 14,
                          fontWeight: 800,
                          color: '#e8f4ff',
                          letterSpacing: '0.03em',
                        }}>
                          {r.label}
                        </span>
                        {r.tag && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            color: r.tagColor ?? '#60c8ff',
                            background: `${r.tagColor ?? '#60c8ff'}18`,
                            border: `1px solid ${r.tagColor ?? '#60c8ff'}50`,
                            borderRadius: 6,
                            padding: '2px 7px',
                          }}>
                            {r.tag}
                          </span>
                        )}
                      </div>
                      <p style={{
                        margin: 0,
                        color: 'rgba(185,220,255,0.68)',
                        fontSize: 13,
                        lineHeight: 1.65,
                      }}>
                        {r.desc}
                      </p>
                    </div>

                    {/* Arrow */}
                    <div style={{
                      flexShrink: 0,
                      color: `${cat.accent}80`,
                      fontSize: 18,
                      alignSelf: 'center',
                    }}>
                      →
                    </div>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* ── Quick Links ── */}
        <div style={{ marginTop: 52 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 18,
          }}>
            <span style={{ fontSize: 18 }}>⚡</span>
            <h2 style={{
              margin: 0,
              fontFamily: "'Orbitron', 'Roboto', sans-serif",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#60c8ff',
              textShadow: '0 0 12px #60c8ff80',
            }}>
              Quick Links
            </h2>
            <div style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(to right, #60c8ff60, transparent)',
              marginLeft: 8,
            }} />
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 12,
          }}>
            {QUICK_LINKS.map(q => (
              <a
                key={q.label}
                href={q.href}
                target="_blank"
                rel="noreferrer"
                style={{
                  ...glass,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 18px',
                  textDecoration: 'none',
                  transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    'inset 0 1px 0 rgba(255,255,255,0.35), 0 10px 28px rgba(0,40,100,0.40), 0 0 0 1px rgba(96,200,255,0.30)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                    'inset 0 1px 0 rgba(255,255,255,0.28), 0 8px 32px rgba(0,20,60,0.30)';
                }}
              >
                <span style={{ fontSize: 20 }}>{q.emoji}</span>
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'rgba(200,232,255,0.85)',
                }}>
                  {q.label}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Footer note ── */}
        <p style={{
          textAlign: 'center',
          color: 'rgba(160,200,255,0.40)',
          fontSize: 12,
          marginTop: 52,
          letterSpacing: '0.04em',
        }}>
          Missing a resource? Ask an organizer on Discord.
        </p>
      </div>
    </>
  );
}
