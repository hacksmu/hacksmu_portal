import { ChevronUpIcon } from '@heroicons/react/solid';

interface AnsweredQuestionProps {
  question: string;
  answer: string;
  colorCode: string;
  iconColorCode: string;
  isOpen: boolean;
  toggleDisclosure: () => void;
}

export default function AnsweredQuestion({
  question,
  answer,
  isOpen,
  toggleDisclosure,
}: AnsweredQuestionProps) {
  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      border: '1px solid rgba(64,255,154,0.28)',
      background: 'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(64,255,154,0.06) 100%)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
    }}>
      {/* Question row */}
      <button
        onClick={toggleDisclosure}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 16px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        {/* Check icon */}
        <span style={{
          width: 20, height: 20, borderRadius: '50%',
          background: 'rgba(64,255,154,0.20)',
          border: '1.5px solid rgba(64,255,154,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          fontSize: 11, color: '#40ff9a',
        }}>
          ✓
        </span>
        <span style={{
          flex: 1,
          color: '#e8f4ff',
          fontSize: 14,
          fontWeight: 600,
          lineHeight: 1.4,
        }}>
          {question}
        </span>
        <ChevronUpIcon
          className={isOpen ? '' : 'rotate-180'}
          style={{
            width: 18, height: 18,
            color: 'rgba(200,232,255,0.55)',
            flexShrink: 0,
            transform: isOpen ? 'none' : 'rotate(180deg)',
            transition: 'transform 0.2s',
          }}
        />
      </button>

      {/* Answer panel */}
      {isOpen && (
        <div style={{
          padding: '10px 16px 14px 46px',
          borderTop: '1px solid rgba(64,255,154,0.15)',
          color: 'rgba(200,232,255,0.80)',
          fontSize: 13,
          lineHeight: 1.6,
          background: 'rgba(64,255,154,0.05)',
        }}>
          {answer}
        </div>
      )}
    </div>
  );
}
