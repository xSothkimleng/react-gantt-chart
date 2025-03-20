import { useRef } from 'react';
import { useGanttChart } from '../../../../../context/GanttChartContext';
import { Row } from '../../../../../types/row';

interface BarDragDropHandlerProps {
  index: number;
  row: Row;
  ganttBarRef: React.RefObject<HTMLDivElement>;
  startLeftPosition: React.MutableRefObject<number>;
}

const BarDragDropHandler: React.FC<BarDragDropHandlerProps> = ({ ganttBarRef, row }) => {
  const { setInteractionState, getSelectedRow } = useGanttChart();
  // Track whether this is a click or drag
  const isClicking = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent timeline drag
    if (row.isLocked) return;

    isClicking.current = true;

    if (ganttBarRef.current) {
      setInteractionState({
        mode: 'barDragging',
        barId: row.id.toString(),
        startX: e.clientX,
        startLeft: parseInt(ganttBarRef.current.style.left || '0', 10),
        rowData: row,
      });
    }
  };

  // Detect if this is a click (for selection) or a drag
  const handleMouseMove = () => {
    isClicking.current = false;
  };

  // Handle selection if this was just a click
  const handleMouseUp = () => {
    if (isClicking.current && getSelectedRow) {
      getSelectedRow(row);
    }
  };

  return (
    <div
      style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: 20 }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  );
};

export default BarDragDropHandler;
