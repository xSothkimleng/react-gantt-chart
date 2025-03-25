import { useRef } from 'react';
import { Row } from '../../../../../types/row';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useGanttChartStore } from '../../../../../stores/GanttChartStore';

interface BarDragDropHandlerProps {
  index: number;
  row: Row;
  ganttBarRef: React.RefObject<HTMLDivElement>;
  startLeftPosition: React.MutableRefObject<number>;
}

const BarDragDropHandler: React.FC<BarDragDropHandlerProps> = ({ ganttBarRef, row }) => {
  const startBarDrag = useInteractionStore(state => state.startBarDrag);
  const selectRow = useGanttChartStore(state => state.externalGetSelectedRow);

  // Track whether this is a click or drag
  const isClicking = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent timeline drag
    if (row.isLocked) return;

    isClicking.current = true;

    if (ganttBarRef.current) {
      startBarDrag({
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
    if (isClicking.current) {
      if (selectRow) selectRow(row);
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
