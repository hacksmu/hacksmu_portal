import React from 'react';

interface GradientDividerProps {
  height?: 'h-1' | 'h-2' | 'h-3' | 'h-4' | 'h-6' | 'h-8' | 'h-10' | 'h-12' | 'h-16';
}

const GradientDivider: React.FC<GradientDividerProps> = ({ height = 'h-8' }) => {
  return (
    <div className={`w-full ${height} bg-gradient-to-r from-neon-pink to-neon-blue my-8 relative overflow-hidden`}>
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white to-transparent animate-shimmer" />
    </div>
  );
};

export default GradientDivider;