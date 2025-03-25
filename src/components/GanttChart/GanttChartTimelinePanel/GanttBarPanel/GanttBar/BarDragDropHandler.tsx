import React, { useRef } from 'react';
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
  const mouseDownTime = useRef<number>(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent timeline drag
    if (row.isLocked) return;

    isClicking.current = true;
    mouseDownTime.current = Date.now();

    if (ganttBarRef.current) {
      // Only start dragging if there's a valid reference to the bar
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
    if (Date.now() - mouseDownTime.current > 150) {
      // If mouse has been held down for more than 150ms, consider it a drag
      isClicking.current = false;
    }
  };

  // Handle selection if this was just a click
  const handleMouseUp = (e: React.MouseEvent) => {
    // Only count as a click if it occurred quickly and mouse didn't move much
    if (isClicking.current && Date.now() - mouseDownTime.current < 300) {
      e.stopPropagation();
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

export default React.memo(BarDragDropHandler);
