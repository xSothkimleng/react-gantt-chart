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
  isGanttBarHovered: boolean;
  style?: React.CSSProperties;
}

const BarResizer: React.FC<ResizeButtonProps> = ({
  position,
  ganttBarRef,
  row,
  width,
  startLeftPosition,
  isGanttBarHovered,
  style,
}) => {
  const startBarResize = useInteractionStore(useShallow(state => state.startBarResize));

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (row.isLocked) return;

      if (ganttBarRef.current) {
        const barWidth = width || parseInt(ganttBarRef.current.style.width || '0', 10);
        const barLeft = startLeftPosition.current || parseInt(ganttBarRef.current.style.left || '0', 10);

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
    [ganttBarRef, position, row, startBarResize, width, startLeftPosition],
  );

  const handleStyle: React.CSSProperties = {
    zIndex: 35,
    height: '100%',
    width: '10px',
    cursor: row.isLocked ? 'not-allowed' : 'ew-resize',
    [position]: '-150px',
    backgroundColor: isGanttBarHovered ? 'rgba(0, 0, 0, 0.3)' : 'transparent',
    transition: 'all 0.2s ease',
    ...style,
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      // onMouseEnter={handleMouseEnter}
      // onMouseLeave={handleMouseLeave}
      className='gantt-bar-resize-handle'
      style={handleStyle}
      data-position={position}
      data-testid={`resize-handle-${position}`}
      title={`Resize ${position} edge`}
    />
  );
};

export default React.memo(BarResizer);
