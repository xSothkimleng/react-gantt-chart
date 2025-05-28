import React from 'react';
import { Row } from '../../types/row';
import { scrollToGanttBar } from '../../utils/scrollUtils';

interface CustomRowProps {
  row: Row;
  isCompactView: boolean;
}

const CustomRowComponent: React.FC<CustomRowProps> = ({ row, isCompactView }) => {
  // Handler for scrolling to the current row's Gantt bar
  const handleScrollToBar = async () => {
    const success = await scrollToGanttBar(row, {
      offset: 100, // Custom offset
      behavior: 'smooth',
    });

    if (!success) {
      console.warn('Failed to scroll to Gantt bar');
    }
  };

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        borderLeft: '2px solid gray',
        paddingLeft: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      {/* Row content */}
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: isCompactView ? '100%' : '50%',
            display: 'flex',
            alignItems: 'center',
          }}>
          {row.name}
        </div>

        {!isCompactView && (
          <div
            style={{
              height: '50%',
              display: 'flex',
              alignItems: 'center',
              fontSize: '0.8em',
              color: '#666',
            }}>
            {row.currentProgress} / {row.maxProgress}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div
        style={{
          display: 'flex',
          marginRight: '2rem',
        }}>
        <button
          onClick={handleScrollToBar}
          style={{
            padding: '2px 6px',
            fontSize: '10px',
            border: '1px solid #ccc',
            borderRadius: '3px',
            background: '#f5f5f5',
            cursor: 'pointer',
          }}
          title='Scroll to this bar'>
          GO
        </button>
      </div>
    </div>
  );
};

export default CustomRowComponent;
