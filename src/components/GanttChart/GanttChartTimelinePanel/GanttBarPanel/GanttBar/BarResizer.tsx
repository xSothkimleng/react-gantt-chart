import React, { useCallback } from 'react';
import { Row } from '../../../../../types/row';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useShallow } from 'zustand/shallow';

interface ResizeButtonProps {
  position: 'left' | 'right';
  ganttBarRef: React.RefObject<HTMLDivElement>;
  row: Row;
  width: number;
  startLeftPosition: React.MutableRefObject<number>;
}

const BarResizer: React.FC<ResizeButtonProps> = ({ position, ganttBarRef, row }) => {
  const startBarResize = useInteractionStore(useShallow(state => state.startBarResize));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (row.isLocked) return;

      if (ganttBarRef.current) {
        const barWidth = parseInt(ganttBarRef.current.style.width || '0', 10);
        const barLeft = parseInt(ganttBarRef.current.style.left || '0', 10);

        startBarResize({
          barId: row.id.toString(),
          edge: position,
          startX: e.clientX,
          startWidth: barWidth,
          startLeft: barLeft,
          rowData: row,
        });
      }
    },
    [ganttBarRef, position, row, startBarResize],
  );

  return (
    <>
      <div
        onMouseDown={handleMouseDown}
        className='gantt-bar-resize-handle'
        style={{
          [position]: '0',
          cursor: row.isLocked ? 'not-allowed' : 'ew-resize',
        }}
      />
    </>
  );
};

export default React.memo(BarResizer);
