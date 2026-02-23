import React from 'react';

function AnouncementCard(props: { text: string; time: string }) {
  return (
    <div style={{
      marginBottom: 10,
      padding: '12px 16px',
      borderRadius: 12,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(80,160,255,0.07) 100%)',
      border: '1px solid rgba(255,255,255,0.18)',
      borderLeft: '3px solid rgba(80,180,255,0.7)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>
      <p style={{
        color: 'rgba(220,240,255,0.92)',
        fontSize: 14,
        lineHeight: 1.5,
        margin: 0,
      }}>
        {props.text}
      </p>
      <p style={{
        color: 'rgba(160,210,255,0.55)',
        fontSize: 11,
        textAlign: 'right',
        margin: '6px 0 0',
        fontFamily: "'Orbitron', monospace",
        letterSpacing: '0.06em',
      }}>
        {props.time}
      </p>
    </div>
  );
}

export default AnouncementCard;
