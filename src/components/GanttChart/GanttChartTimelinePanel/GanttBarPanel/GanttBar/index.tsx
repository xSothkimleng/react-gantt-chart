import React, { useRef, useState, useMemo, useCallback } from 'react';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
} from '../../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useConfigStore } from '../../../../../stores/useConfigStore';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';

class GanttBarErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GanttBar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '10px',
            border: '1px solid #ff0000',
            borderRadius: '4px',
            color: '#ff0000',
          }}>
          Error loading GanttBar. Please try refreshing.
        </div>
      );
    }

    return this.props.children;
  }
}

// Define prop types clearly
type GanttBarProps = {
  index: number;
  rowId: string | number;
};

const GanttBar: React.FC<GanttBarProps> = ({ index, rowId }) => {
  // Get row data with useShallow to prevent re-renders on unrelated state changes
  const row = useRowsStore(state => state.getRowById(rowId));

  // Get only the required state from interaction store
  const interactionMode = useInteractionStore(state => state.interactionState.mode);

  // Get only the needed config values
  const { chartTimeFrameView, chartDateRange, zoomWidth } = useConfigStore(
    useShallow(state => ({
      chartTimeFrameView: state.chartTimeFrameView,
      chartDateRange: state.chartDateRange,
      zoomWidth: state.zoomWidth,
    })),
  );

  const [isHovered, setIsHovered] = useState(false);
  const ganttBarRef = useRef<HTMLDivElement | null>(null);
  const startLeftPosition = useRef<number>(0);

  // Memoize calculations that depend on row data
  const { width, positionLeft } = useMemo(() => {
    if (!row || !chartDateRange.length) {
      return { width: 0, positionLeft: 0 };
    }

    const durationBarWidth = calculateDurationBetweenDate(row.start, row.end);
    const dayWidthUnit = chartTimeFrameView.dayWidthUnit + zoomWidth;

    const width = durationBarWidth * dayWidthUnit;
    const positionLeft = calculateGanttBarPositionFromInitialStartingPoint(row.start, chartDateRange[0]) * dayWidthUnit;

    return { width, positionLeft };
  }, [row, chartDateRange, chartTimeFrameView.dayWidthUnit, zoomWidth]);

  // Memoize event handlers
  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Update the ref value - must be done outside of render conditionals
  if (row) {
    startLeftPosition.current = positionLeft;
  }

  // Handle the case when there's no row data (avoid conditional rendering)
  if (!row) {
    return null;
  }

  return (
    <GanttBarErrorBoundary>
      <div
        ref={ganttBarRef}
        data-bar-id={row.id.toString()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        role='button'
        aria-label={`GanttBar: ${row.name}`}
        className='gantt-bar'
        style={{
          top: `${index * 41}px`,
          left: `${positionLeft}px`,
          width: `${width}px`,
          cursor: interactionMode === 'barResizing' ? 'ew-resize' : 'grab',
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
          {isHovered && (
            <>
              <BarResizer
                position='left'
                row={row}
                width={width}
                ganttBarRef={ganttBarRef}
                startLeftPosition={startLeftPosition}
              />
              <BarResizer
                position='right'
                row={row}
                width={width}
                ganttBarRef={ganttBarRef}
                startLeftPosition={startLeftPosition}
              />
            </>
          )}

          <div className='gantt-bar-text-cell'>
            <p className='gantt-bar-text' title={row.name}>
              {row.name}
              {row.showProgressIndicator?.showLabelOnGanttBar && row.progressIndicatorLabel}
            </p>
          </div>
        </div>
      </div>
    </GanttBarErrorBoundary>
  );
};

export default React.memo(GanttBar);
