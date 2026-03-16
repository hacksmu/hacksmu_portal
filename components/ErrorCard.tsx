import { XIcon } from '@heroicons/react/solid';

interface ErrorCardProps {
  errorMsg: string;
  onClose: () => void;
}

export default function ErrorCard({ errorMsg, onClose }: ErrorCardProps) {
  return (
    <div
      style={{
        width: '100%',
        padding: '12px 14px',
        borderRadius: 14,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        background:
          'linear-gradient(135deg, rgba(255,120,120,0.18) 0%, rgba(110,20,40,0.16) 100%)',
        border: '1px solid rgba(255,150,150,0.34)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16), 0 6px 22px rgba(40,0,20,0.20)',
        backdropFilter: 'blur(18px) saturate(180%)',
        WebkitBackdropFilter: 'blur(18px) saturate(180%)',
      }}
    >
      <div
        style={{
          color: '#ffe8e8',
          fontSize: 14,
          lineHeight: 1.5,
          fontWeight: 600,
        }}
      >
        {errorMsg}
      </div>
      <XIcon
        style={{
          width: 18,
          height: 18,
          cursor: 'pointer',
          color: 'rgba(255,220,220,0.82)',
          flexShrink: 0,
          marginTop: 1,
        }}
        onClick={() => {
          onClose();
        }}
      />
    </div>
  );
}
