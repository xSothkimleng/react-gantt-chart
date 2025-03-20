import React from 'react';
import { Row } from '../../../../../types/row';

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
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: `${calculateProgress()}%`,
          background: 'rgba(41, 185, 106, 0.6)',
          pointerEvents: 'none',
          borderRight: '1px solid rgba(0,0,0,0.1)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}>
        <div
          style={{
            position: 'absolute',
            right: '4px',
            zIndex: 20,
            fontSize: '0.9em',
            padding: '0 4px',
            backgroundColor: 'rgba(41, 185, 106, 0.8)',
            borderRadius: '2px',
            minWidth: '40px',
            textAlign: 'center',
          }}
          role='status'
          aria-label={`Progress: ${calculateProgress().toFixed(0)}%`}
        />
      </div>
    )
  );
};

export default BarProgressIndicator;
