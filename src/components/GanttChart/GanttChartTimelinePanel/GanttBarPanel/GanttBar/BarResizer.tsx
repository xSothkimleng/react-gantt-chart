import React from 'react';
import { Row } from '../../../../../types/row';
import { useGanttChart } from '../../../../../context/GanttChartContext';

interface ResizeButtonProps {
  position: 'left' | 'right';
  ganttBarRef: React.RefObject<HTMLDivElement>;
  row: Row;
  width: number;
  startLeftPosition: React.MutableRefObject<number>;
}

const BarResizer: React.FC<ResizeButtonProps> = ({ position, ganttBarRef, row }) => {
  const { setInteractionState } = useGanttChart();

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent dragging or timeline drag

    if (row.isLocked) return;

    if (ganttBarRef.current) {
      setInteractionState({
        mode: 'barResizing',
        barId: row.id.toString(),
        edge: position,
        startX: e.clientX,
        startWidth: parseInt(ganttBarRef.current.style.width || '0', 10),
        startLeft: parseInt(ganttBarRef.current.style.left || '0', 10),
        rowData: row,
      });
    }
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className='gantt-bar-resize-handle'
      style={{
        [position]: '0',
        cursor: row.isLocked ? 'grab' : 'ew-resize',
      }}
    />
  );
};

export default BarResizer;
