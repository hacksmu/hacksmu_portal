import React from 'react';

interface ChallengeCardProps {
  title: string;
  description?: string;
  prizes?: string[];
  organization?: string;
  expanded?: boolean;
  onToggle?: () => void;
}

function ChallengeCard({ title, description, prizes, organization, expanded, onToggle }: ChallengeCardProps) {
  const desc = description ? description.replaceAll('\\n', '\n') : undefined;

  return (
    <div
      onClick={onToggle}
      style={{
        padding: '16px 18px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(100,160,255,0.08) 100%)',
        border: '1px solid rgba(255,255,255,0.20)',
        borderTop: '2px solid rgba(255,208,64,0.55)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 4px 16px rgba(0,20,60,0.20)',
        cursor: onToggle ? 'pointer' : 'default',
        transition: 'all 0.22s',
      }}
      onMouseEnter={e => {
        if (onToggle) (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.16) 0%, rgba(100,160,255,0.12) 100%)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(100,160,255,0.08) 100%)';
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div>
          {organization && (
            <div style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(255,208,64,0.80)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: 4,
            }}>
              {organization}
            </div>
          )}
          <div style={{
            fontSize: 15,
            fontWeight: 800,
            color: '#e8f4ff',
            fontFamily: "'Orbitron', 'Roboto', sans-serif",
            letterSpacing: '0.02em',
          }}>
            {title}
          </div>
        </div>
        {onToggle && (
          <div style={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.10)',
            border: '1px solid rgba(255,255,255,0.20)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: 'rgba(200,230,255,0.70)',
            fontSize: 14,
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'none',
          }}>
            ▾
          </div>
        )}
      </div>

      {/* Expanded content */}
      {(expanded || !onToggle) && desc && (
        <div style={{
          marginTop: 12,
          paddingTop: 12,
          borderTop: '1px solid rgba(255,255,255,0.10)',
          color: 'rgba(200,228,255,0.80)',
          fontSize: 13,
          lineHeight: 1.6,
          whiteSpace: 'pre-line',
        }}>
          {desc}
        </div>
      )}

      {(expanded || !onToggle) && prizes && prizes.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'rgba(255,208,64,0.80)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
            Prizes
          </div>
          <ol style={{ margin: 0, paddingLeft: 20 }}>
            {prizes.map((prize, idx) => (
              <li key={idx} style={{
                color: 'rgba(220,240,255,0.85)',
                fontSize: 13,
                lineHeight: 1.7,
              }}>
                {prize}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Collapsed hint */}
      {onToggle && !expanded && (
        <div style={{
          marginTop: 8,
          color: 'rgba(160,210,255,0.50)',
          fontSize: 11,
        }}>
          Click to expand
        </div>
      )}
    </div>
  );
}

export default ChallengeCard;
