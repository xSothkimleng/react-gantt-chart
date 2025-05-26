import React, { useRef, useState, useMemo, useCallback } from 'react';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
import BarTooltip from './ToolTip';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
} from '../../../../../utils/ganttBarUtils';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useConfigStore } from '../../../../../stores/useConfigStore';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useShallow } from 'zustand/shallow';
import './styles.css';
import { useUIStore } from '../../../../../stores/useUIStore';

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

  // UI Config Store
  const rowHeight = useUIStore(state => state.rowHeight);
  const isCompactView = useConfigStore(state => state.isCompactView);

  // Get interaction state to determine if this bar is being interacted with
  const interactionState = useInteractionStore(useShallow(state => state.interactionState));

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

  // Determine if tooltip should be shown for this specific bar
  const isThisBarBeingDragged =
    (interactionState.mode === 'barDragging' || interactionState.mode === 'barResizing') &&
    'barId' in interactionState &&
    interactionState.barId === row.id.toString();

  // Tooltip visibility and position are stored in the interaction state
  const showTooltip = isThisBarBeingDragged;

  // Calculate the real-time dates based on the current position/width
  const calculateRealTimeDates = () => {
    if (!isThisBarBeingDragged || !ganttBarRef.current) {
      return { startDate: new Date(row.start), endDate: new Date(row.end) };
    }

    const dayWidth = chartTimeFrameView.dayWidthUnit + zoomWidth;
    const barElement = ganttBarRef.current;

    // Get current position and width
    const currentLeft = parseInt(barElement.style.left || '0', 10);
    const currentWidth = parseInt(barElement.style.width || '0', 10);

    // Calculate days from origin
    const daysFromOrigin = Math.round(currentLeft / dayWidth);
    const durationDays = Math.round(currentWidth / dayWidth);

    // Handle the date range type properly
    // Assuming chartDateRange[0] contains a date string or timestamp
    // If it's a complex object, extract the date value from it
    const originDate =
      typeof chartDateRange[0] === 'string' || typeof chartDateRange[0] === 'number'
        ? new Date(chartDateRange[0])
        : // eslint-disable-next-line @typescript-eslint/no-explicit-any
          new Date((chartDateRange[0] as any).date || (chartDateRange[0] as any).timestamp || row.start);

    const calculatedStartDate = new Date(originDate);
    calculatedStartDate.setDate(originDate.getDate() + daysFromOrigin);

    const calculatedEndDate = new Date(calculatedStartDate);
    calculatedEndDate.setDate(calculatedStartDate.getDate() + durationDays);

    return { startDate: calculatedStartDate, endDate: calculatedEndDate };
  };

  const { startDate, endDate } = calculateRealTimeDates();

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
          top: isCompactView ? `${(index * (rowHeight + 1)) / 2}px` : `${index * (rowHeight + 1)}px`,
          left: `${positionLeft}px`,
          width: `${width}px`,
          cursor: interactionState.mode === 'barResizing' ? 'ew-resize' : 'grab',
          opacity: isHovered ? 0.9 : 1,
          height: isCompactView ? `${rowHeight / 2}px` : `${rowHeight}px`,
        }}>
        <div
          className='gantt-bar-cell-overlay'
          style={{
            background: row.highlight ? 'var(--gantt-bar-highlight-background)' : 'var(--gantt-bar-default-background)',
            boxShadow: isHovered ? 'var(--gantt-bar-boxShadow-hover)' : 'none',
            height: isCompactView ? `calc(${rowHeight / 2}px - 30%)` : `calc(${rowHeight}px - 30%)`,
          }}>
          {row.showProgressIndicator?.showProgressBar && <BarProgressIndicator item={row} />}
          <BarDragDropHandler index={index} row={row} startLeftPosition={startLeftPosition} ganttBarRef={ganttBarRef} />

          <BarResizer
            position='left'
            style={{ left: '-13px' }}
            row={row}
            width={width}
            ganttBarRef={ganttBarRef}
            startLeftPosition={startLeftPosition}
            isGanttBarHovered={isHovered}
          />
          <BarResizer
            position='right'
            style={{ right: '-13px' }}
            row={row}
            width={width}
            ganttBarRef={ganttBarRef}
            startLeftPosition={startLeftPosition}
            isGanttBarHovered={isHovered}
          />

          <div className='gantt-bar-text-cell'>
            <p className='gantt-bar-text' title={row.name}>
              {row.name}
              {row.showProgressIndicator?.showLabelOnGanttBar && row.progressIndicatorLabel}
            </p>
          </div>
        </div>

        {/* Tooltip component */}
        {showTooltip && (
          <BarTooltip
            startDate={startDate}
            endDate={endDate}
            position={'tooltipPosition' in interactionState ? interactionState.tooltipPosition : { x: 0, y: 0 }}
            visible={showTooltip}
          />
        )}
      </div>
    </GanttBarErrorBoundary>
  );
};

export default React.memo(GanttBar);
