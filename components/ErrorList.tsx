import ErrorCard from './ErrorCard';

interface ErrorListProps {
  errors: string[];
  onClose: (idx: number) => void;
}

export default function ErrorList({ errors, onClose }: ErrorListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {errors.map((error, idx) => (
        <ErrorCard
          key={idx}
          errorMsg={error}
          onClose={() => {
            onClose(idx);
          }}
        />
      ))}
    </div>
  );
}
