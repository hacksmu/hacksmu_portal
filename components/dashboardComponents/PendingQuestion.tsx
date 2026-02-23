interface PendingQuestionProps {
  question: string;
}

export default function PendingQuestion({ question }: PendingQuestionProps) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '11px 16px',
      borderRadius: 10,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,160,64,0.07) 100%)',
      border: '1px solid rgba(255,160,64,0.28)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
    }}>
      <span style={{
        width: 9, height: 9,
        borderRadius: '50%',
        background: '#ffa040',
        boxShadow: '0 0 8px rgba(255,160,64,0.70)',
        flexShrink: 0,
      }} />
      <span style={{ color: 'rgba(220,240,255,0.88)', fontSize: 14, lineHeight: 1.4 }}>
        {question}
      </span>
      <span style={{
        marginLeft: 'auto',
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'rgba(255,160,64,0.70)',
        textTransform: 'uppercase',
      }}>
        Pending
      </span>
    </div>
  );
}
