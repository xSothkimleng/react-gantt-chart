// src/components/GanttChart/GanttChartTimelinePanel/GanttBarPanel/GanttBar/index.tsx
import React, { useRef, useState, useMemo, useCallback } from 'react';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
// import { useGanttChartStore } from '../../../../../stores/GanttChartStore';
// import {
//   calculateDurationBetweenDate,
//   calculateGanttBarPositionFromInitialStartingPoint,
//   findRowById,
// } from '../../../../../utils/ganttBarUtils';
// import { progressFormatter } from '../../../../../utils/progressFormater';
// import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import './styles.css';
import { useGanttChartStore } from '../../../../../../stores/GanttChartStore';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
  findRowById,
} from '../../../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../../../stores/useInteractionStore';
import { progressFormatter } from '../../../../../../utils/progressFormater';

type GanttBarProps = {
  index: number;
  rowId: string | number; // Changed from row to rowId
};

const GanttBar: React.FC<GanttBarProps> = React.memo(({ index, rowId }) => {
  // Extract only the data needed from this specific row
  const row = useGanttChartStore(state => {
    const directRow = state.rows.find(r => r.id.toString() === rowId.toString());
    return directRow || findRowById(state.rows, rowId);
  });

  // Separately subscribe to other store values to avoid unnecessary re-renders
  const isLoading = useGanttChartStore(state => state.isLoading);
  const dayWidthUnit = useGanttChartStore(state => state.chartTimeFrameView.dayWidthUnit);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const chartDateRange = useGanttChartStore(state => (state.chartDateRange.length > 0 ? state.chartDateRange[0] : null));

  const interactionState = useInteractionStore(state => state.interactionState);

  const [isHovered, setIsHovered] = useState(false);
  const ganttBarRef = useRef<HTMLDivElement | null>(null);
  const startLeftPosition = useRef<number>(0);

  // Memoize the hover handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Move all calculations into useMemo BEFORE any conditionals
  const barDetails = useMemo(() => {
    // If missing required data, return default values
    if (!row || !chartDateRange) {
      return {
        width: 0,
        positionLeft: 0,
        progressDisplay: '',
        shouldRender: false,
      };
    }

    // Calculate width and position
    const durationBarWidth = calculateDurationBetweenDate(row.start, row.end);
    const dayWidth = dayWidthUnit + zoomWidth;
    const width = durationBarWidth * dayWidth;
    const positionLeft = calculateGanttBarPositionFromInitialStartingPoint(row.start, chartDateRange) * dayWidth;

    // Calculate progress display
    let progressDisplay = '';
    if (row.currentProgress !== undefined && row.maxProgress !== undefined) {
      progressDisplay = progressFormatter(
        row.currentProgress,
        row.maxProgress,
        {
          comma: true,
          decimal: row.progressIndicatorLabel?.decimal ?? 2,
          prefix: row.progressIndicatorLabel?.prefix ?? '',
          suffix: row.progressIndicatorLabel?.suffix ?? '',
        },
        row.progressIndicatorLabelFormatter,
      );
    }

    return {
      width,
      positionLeft,
      progressDisplay,
      shouldRender: true,
    };
  }, [row, chartDateRange, dayWidthUnit, zoomWidth]);

  // Set the ref value
  startLeftPosition.current = barDetails.positionLeft;

  // Early return after all hooks have been called
  if (!row || !chartDateRange || !barDetails.shouldRender) {
    return null;
  }

  return (
    <div
      ref={ganttBarRef}
      data-bar-id={row.id.toString()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role='button'
      aria-label={`GanttBar: ${row.name}`}
      aria-busy={isLoading}
      className='gantt-bar'
      style={{
        top: `${index * 41}px`,
        left: `${barDetails.positionLeft}px`,
        width: `${barDetails.width}px`,
        cursor: interactionState.mode === 'barResizing' ? 'ew-resize' : 'grab',
        opacity: isHovered ? 0.9 : 1,
      }}>
      <div
        className='gantt-bar-cell-overlay'
        style={{
          background: row.highlight ? 'var(--gantt-bar-highlight-background)' : 'var(--gantt-bar-default-background)',
          boxShadow: isHovered ? 'var(--gantt-bar-boxShadow-hover)' : 'none',
        }}>
        {row.showProgressIndicator?.showProgressBar && <BarProgressIndicator item={row} />}
        <BarDragDropHandler index={index} row={row} startLeftPosition={startLeftPosition} ganttBarRef={ganttBarRef} />
        <BarResizer
          position='right'
          row={row}
          width={barDetails.width}
          ganttBarRef={ganttBarRef}
          startLeftPosition={startLeftPosition}
        />
        <div className='gantt-bar-text-cell'>
          <p className='gantt-bar-text' title={row.name}>
            {row.name}
          </p>
          {row.showProgressIndicator?.showLabel && <span className='gnatt-bar-progress-text'>{barDetails.progressDisplay}</span>}
        </div>
      </div>
    </div>
  );
});

export default GanttBar;
