// For BarProgressIndicator.tsx
import React, { useMemo } from 'react';
import { Row } from '../../../../../types/row';

type BarProgressIndicatorProps = {
  item: Row;
};

const BarProgressIndicator: React.FC<BarProgressIndicatorProps> = ({ item }) => {
  const progress = useMemo(() => {
    if (!item.currentProgress || !item.maxProgress || item.maxProgress === 0) {
      return 0;
    }

    try {
      const calculatedProgress = (item.currentProgress / item.maxProgress) * 100;
      return Number.isFinite(calculatedProgress) ? calculatedProgress : 0;
    } catch {
      return 0;
    }
  }, [item.currentProgress, item.maxProgress]);

  return (
    <div
      role='progressbar'
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className='gantt-bar-progress-indicator'
      style={{
        width: `${progress}%`,
      }}
    />
  );
};

export default React.memo(BarProgressIndicator);
