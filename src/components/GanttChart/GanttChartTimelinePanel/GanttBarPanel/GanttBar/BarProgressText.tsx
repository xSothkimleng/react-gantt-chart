import React from 'react';
import { Row } from '../../../../../types/row';

type BarProgress = {
  row: Row;
};

const BarProgressText: React.FC<BarProgress> = React.memo(({ row }) => {
  // Only re-render when progress values change
  const currentProgress = row.currentProgress;
  const maxProgress = row.maxProgress;

  if (currentProgress === undefined || maxProgress === undefined) return null;

  const formattedProgress = ` : ${currentProgress} / ${maxProgress}`;

  return <span className='gnatt-bar-progress-text'>{formattedProgress}</span>;
});

export default BarProgressText;
