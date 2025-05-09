import React from 'react';

interface BarTooltipProps {
  startDate: Date | string;
  endDate: Date | string;
  position: { x: number; y: number };
  visible: boolean;
}

const BarTooltip: React.FC<BarTooltipProps> = ({ startDate, endDate, position, visible }) => {
  if (!visible) return null;

  // Format dates in a user-friendly way
  const formatDate = (date: Date | string): string => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className='gantt-bar-tooltip'
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
        transform: 'translateX(-50%)',
        zIndex: 1000,
        pointerEvents: 'none',
      }}>
      <div className='gantt-bar-tooltip-content'>
        <div className='gantt-bar-tooltip-dates'>
          <span>
            {formatDate(startDate)} - {formatDate(endDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(BarTooltip);
