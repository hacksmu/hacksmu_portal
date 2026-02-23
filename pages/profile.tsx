import { useRouter } from 'next/router';
import Head from 'next/head';
import React, { useRef, useState } from 'react';
import { useAuthContext } from '../lib/user/AuthContext';
import LoadIcon from '../components/LoadIcon';
import { getFileExtension } from '../lib/util';
import QRCode from '../components/dashboardComponents/QRCode';

/**
 * Comprehensive profile page — Frutiger Aero glass style.
 * Route: /profile
 */
export default function ProfilePage() {
  const router = useRouter();
  const { isSignedIn, hasProfile, user, profile } = useAuthContext();
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const resumeRef = useRef<HTMLInputElement>(null);

  const handleResumeUpload = () => {
    if (!resumeRef.current?.files?.length) return;
    if (resumeRef.current.files.length !== 1) return alert('Must submit one file');

    const fileExtension = getFileExtension(resumeRef.current.files[0].name);
    const accepted = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.txt', '.tex', '.rtf'];
    if (!accepted.includes(fileExtension))
      return alert(`Accepted file types: ${accepted.join(' ')}`);

    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('resume', resumeRef.current.files[0]);
    formData.append('fileName', `${user.id}${fileExtension}`);
    formData.append('studyLevel', profile.studyLevel);
    formData.append('major', profile.major);

    fetch('/api/resume/upload', { method: 'post', body: formData }).then((res) => {
      setUploading(false);
      setUploadMsg(res.status === 200
        ? { ok: true, text: 'Resume updated successfully!' }
        : { ok: false, text: 'Resume upload failed. Please try again.' });
    });
  };

  if (!isSignedIn) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-panel" style={{ padding: '32px 48px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ color: 'rgba(160,230,255,0.9)', fontWeight: 700, fontSize: 16 }}>
            Sign in to view your profile
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    router.push('/register');
    return null;
  }

  const p = profile;
  const fullName = `${p.user.firstName} ${p.user.lastName}`;
  const role = p.user.permissions?.[0] ?? 'hacker';

  const ROLE_COLORS: Record<string, string> = {
    admin: '#ff8844',
    super_admin: '#ff4488',
    organizer: '#b080ff',
    sponsor: '#ffd040',
    judge: '#40ffb8',
    hacker: '#60b8ff',
  };
  const roleColor = ROLE_COLORS[role] ?? '#60b8ff';

  return (
    <>
      <Head>
        <title>HackSMU VII — {fullName}</title>
      </Head>

      <div style={{ padding: '24px 20px 48px', maxWidth: 960, margin: '0 auto' }}>

        {/* ── HERO CARD ── */}
        <div
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 28,
            padding: '28px 32px',
            marginBottom: 24,
            alignItems: 'center',
          }}
        >
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              background: `radial-gradient(ellipse at 35% 28%, rgba(255,255,255,0.85) 0%, ${roleColor}88 35%, ${roleColor} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              boxShadow: `0 0 28px ${roleColor}55, inset 0 2px 0 rgba(255,255,255,0.5)`,
              border: `2px solid ${roleColor}88`,
            }}>
              {p.user.firstName?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: 22,
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 0 16px rgba(0,200,255,0.6)',
              letterSpacing: '0.04em',
            }}>
              {fullName}
            </div>
            <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <span style={{
                display: 'inline-block',
                padding: '3px 12px',
                borderRadius: 20,
                background: `${roleColor}22`,
                border: `1px solid ${roleColor}66`,
                color: roleColor,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {role}
              </span>
              {p.university && (
                <span style={{
                  display: 'inline-block',
                  padding: '3px 12px',
                  borderRadius: 20,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: 'rgba(180,220,255,0.85)',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                }}>
                  🎓 {p.university}
                </span>
              )}
            </div>
            <div style={{ marginTop: 8, color: 'rgba(140,200,255,0.7)', fontSize: 13 }}>
              {p.user.preferredEmail}
            </div>
          </div>

          {/* Social links */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {p.github && (
              <a href={p.github.startsWith('http') ? p.github : `https://github.com/${p.github}`}
                target="_blank" rel="noreferrer"
                style={socialBtnStyle('#888')}
              >
                <GithubIcon /> GitHub
              </a>
            )}
            {p.linkedin && (
              <a href={p.linkedin.startsWith('http') ? p.linkedin : `https://linkedin.com/in/${p.linkedin}`}
                target="_blank" rel="noreferrer"
                style={socialBtnStyle('#0a66c2')}
              >
                <LinkedInIcon /> LinkedIn
              </a>
            )}
            {p.website && (
              <a href={p.website} target="_blank" rel="noreferrer" style={socialBtnStyle('#40b8ff')}>
                🌐 Website
              </a>
            )}
          </div>
        </div>

        {/* ── GRID ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

          {/* QR Code card */}
          <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
            <SectionHeader icon="📲" label="Check-in QR" />
            <div style={{
              padding: 12,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.92)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            }}>
              <QRCode data={'hack:' + user.id} loading={false} width={160} height={160} />
            </div>
            <div style={{ fontSize: 11, color: 'rgba(140,200,255,0.6)', textAlign: 'center' }}>
              Show this to volunteers at check-in
            </div>
          </div>

          {/* Academic info */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <SectionHeader icon="🎓" label="Academic Info" />
            <InfoGrid rows={[
              { label: 'University', value: p.university },
              { label: 'Major', value: p.major },
              { label: 'Study Level', value: p.studyLevel },
              { label: 'Age', value: p.age?.toString() },
              { label: 'Gender', value: p.gender },
            ]} />
          </div>

          {/* Hackathon experience */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <SectionHeader icon="💻" label="Hackathon Profile" />
            <InfoGrid rows={[
              { label: 'Hackathons Attended', value: p.hackathonExperience?.toString() },
              { label: 'Software Experience', value: p.softwareExperience },
              { label: 'Heard From', value: p.heardFrom },
              { label: 'T-Shirt Size', value: p.size },
            ]} />
          </div>

          {/* Dietary & accommodations */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <SectionHeader icon="🍽️" label="Dietary & Accessibility" />
            <div style={{ marginTop: 12 }}>
              <div style={labelStyle}>Dietary Restrictions</div>
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.dietary?.length
                  ? p.dietary.map((d) => <Tag key={d} label={d} color="#40ffb8" />)
                  : <span style={emptyStyle}>None specified</span>
                }
              </div>
            </div>
            {p.accomodations && (
              <div style={{ marginTop: 14 }}>
                <div style={labelStyle}>Accommodations</div>
                <div style={{ marginTop: 6, fontSize: 13, color: 'rgba(200,230,255,0.85)', lineHeight: 1.5 }}>
                  {p.accomodations}
                </div>
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <SectionHeader icon="📄" label="Resume" />
            <div style={{ marginTop: 12 }}>
              {p.resume ? (
                <a
                  href={p.resume}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: 'rgba(60,180,255,0.15)',
                    border: '1px solid rgba(60,180,255,0.35)',
                    color: 'rgba(100,210,255,0.9)',
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginBottom: 14,
                  }}
                >
                  📎 View Current Resume
                </a>
              ) : (
                <div style={{ ...emptyStyle, marginBottom: 14 }}>No resume uploaded yet</div>
              )}

              <div>
                <input
                  id="resume"
                  style={{ display: 'none' }}
                  type="file"
                  ref={resumeRef}
                  onChange={handleResumeUpload}
                  accept=".pdf, .doc, .docx, image/png, image/jpeg, .txt, .tex, .rtf"
                />
                {uploading ? (
                  <LoadIcon width={24} height={24} />
                ) : (
                  <label
                    htmlFor="resume"
                    className="aero-btn"
                    style={{ fontSize: 12, padding: '7px 16px', cursor: 'pointer' }}
                  >
                    {p.resume ? '↑ Update Resume' : '↑ Upload Resume'}
                  </label>
                )}
                {uploadMsg && (
                  <div style={{
                    marginTop: 10,
                    fontSize: 12,
                    fontWeight: 600,
                    color: uploadMsg.ok ? '#40ffb8' : '#ff6060',
                  }}>
                    {uploadMsg.ok ? '✓' : '✗'} {uploadMsg.text}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sponsor interests */}
          {p.companies?.length > 0 && (
            <div className="glass-panel" style={{ padding: 24 }}>
              <SectionHeader icon="🤝" label="Sponsor Interests" />
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {p.companies.map((c) => <Tag key={c} label={c} color="#ffd040" />)}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function SectionHeader({ icon, label }: { icon: string; label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 4,
      paddingBottom: 10,
      borderBottom: '1px solid rgba(255,255,255,0.12)',
    }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{
        fontSize: 12,
        fontWeight: 800,
        color: 'rgba(160,230,255,0.9)',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
    </div>
  );
}

function InfoGrid({ rows }: { rows: { label: string; value?: string | null }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
      {rows.map(({ label, value }) =>
        value ? (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
            <span style={labelStyle}>{label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(220,240,255,0.9)', textAlign: 'right' }}>
              {value}
            </span>
          </div>
        ) : null
      )}
    </div>
  );
}

function Tag({ label, color }: { label: string; color: string }) {
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 12,
      background: `${color}18`,
      border: `1px solid ${color}44`,
      color: color,
      fontSize: 11,
      fontWeight: 700,
    }}>
      {label}
    </span>
  );
}

function socialBtnStyle(color: string): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 13px',
    borderRadius: 16,
    background: `${color}18`,
    border: `1px solid ${color}44`,
    color: `${color}dd`,
    fontSize: 12,
    fontWeight: 600,
    textDecoration: 'none',
    transition: 'all 0.2s',
  };
}

function GithubIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: 'rgba(120,180,220,0.7)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
};

const emptyStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(140,180,220,0.45)',
  fontStyle: 'italic',
};
