import React from 'react';
import { Row } from '../../../../../../types/row';

type BarProgressIndicatorProps = {
  item: Row;
};

const BarProgressIndicator: React.FC<BarProgressIndicatorProps> = ({ item }) => {
  const calculateProgress = (): number => {
    if (!item.currentProgress || !item.maxProgress || item.maxProgress === 0) {
      return 0;
    }
    try {
      const progress = (item.currentProgress / item.maxProgress) * 100;

      if (!Number.isFinite(progress)) {
        return 0;
      }
      return progress;
    } catch {
      return 0;
    }
  };

  return (
    item.currentProgress !== undefined &&
    item.maxProgress !== undefined && (
      <div
        role='progressbar'
        aria-valuenow={calculateProgress()}
        aria-valuemin={0}
        aria-valuemax={100}
        className='gantt-bar-progress-indicator'
        style={{
          width: `${calculateProgress()}%`,
        }}></div>
    )
  );
};

export default React.memo(BarProgressIndicator);
