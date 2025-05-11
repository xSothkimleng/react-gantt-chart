import React, { useRef } from 'react';
import { Row } from '../../../../../types/row';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useUIStore } from '../../../../../stores/useUIStore';
import { useShallow } from 'zustand/shallow';

interface BarDragDropHandlerProps {
  index: number;
  row: Row;
  ganttBarRef: React.RefObject<HTMLDivElement>;
  startLeftPosition: React.MutableRefObject<number>;
}

const BarDragDropHandler: React.FC<BarDragDropHandlerProps> = ({ ganttBarRef, row }) => {
  const startBarDrag = useInteractionStore(state => state.startBarDrag);
  const selectRow = useUIStore(useShallow(state => state.externalGetSelectedRow));

  // Track mouse state
  const isMouseDown = useRef<boolean>(false);
  const hasDragStarted = useRef<boolean>(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent timeline drag

    if (row.isLocked) {
      if (selectRow) selectRow(row);
      return;
    }

    // Just record that mouse is down, but don't start drag yet
    isMouseDown.current = true;
    hasDragStarted.current = false;
  };

  // Only start drag when mouse moves while button is held down
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown.current || hasDragStarted.current) return;

    // If mouse is moving while button is held, start drag
    if (ganttBarRef.current) {
      hasDragStarted.current = true;

      startBarDrag({
        barId: row.id.toString(),
        startX: e.clientX,
        startLeft: parseInt(ganttBarRef.current.style.left || '0', 10),
        rowData: row,
      });
    }
  };

  // Handle selection if this was just a click
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown.current) return;

    // Reset mouse state
    isMouseDown.current = false;

    // If we never started a drag, treat it as a click
    if (!hasDragStarted.current) {
      e.stopPropagation();
      if (selectRow) selectRow(row);
    }

    // Reset drag state
    hasDragStarted.current = false;
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
