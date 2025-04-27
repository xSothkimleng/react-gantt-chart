import React from 'react';

type BarProgress = {
  label?: string;
};

const BarProgressText: React.FC<BarProgress> = React.memo(({ label }) => {
  const progressIndicatorLabel = label || '';
  const formattedProgress = `${progressIndicatorLabel}`;

  return <span className='gnatt-bar-progress-text'>{formattedProgress}</span>;
});

export default BarProgressText;
