interface PendingQuestionProps {
  question: string;
  submittedAt?: string;
}

function formatSubmittedAt(submittedAt?: string) {
  if (!submittedAt) return null;

  const parsedDate = new Date(submittedAt);
  if (Number.isNaN(parsedDate.getTime())) return null;

  return parsedDate.toLocaleString();
}

export default function PendingQuestion({ question, submittedAt }: PendingQuestionProps) {
  const formattedSubmittedAt = formatSubmittedAt(submittedAt);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
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
        marginTop: 4,
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{ color: 'rgba(220,240,255,0.88)', fontSize: 14, lineHeight: 1.4 }}>
          {question}
        </div>
        {formattedSubmittedAt && (
          <div
            style={{
              marginTop: 6,
              color: 'rgba(200,232,255,0.58)',
              fontSize: 12,
              lineHeight: 1.3,
            }}
          >
            Submitted {formattedSubmittedAt}
          </div>
        )}
      </div>
      <span style={{
        marginLeft: 'auto',
        flexShrink: 0,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.06em',
        color: 'rgba(255,160,64,0.70)',
        textTransform: 'uppercase',
        paddingTop: 2,
      }}>
        Pending
      </span>
    </div>
  );
}
