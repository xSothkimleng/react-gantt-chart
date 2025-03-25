// src/components/GanttChart/GanttChartTimelinePanel/GanttBarPanel/GanttBar/index.tsx
import React, { useRef, useState, memo } from 'react';
import { useConfigStore, useInteractionStore } from '../../../../../stores';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
import { Row } from '../../../../../types/row';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
} from '../../../../../utils/ganttBarUtils';
import { progressFormatter } from '../../../../../utils/progressFormater';
import './styles.css';

type GanttBarProps = {
  index: number;
  row: Row;
  getSelectedRow?: (row: Row) => void;
};

const GanttBar: React.FC<GanttBarProps> = ({ index, row, getSelectedRow }) => {
  // Use Zustand stores instead of context
  const { chartTimeFrameView, chartDateRange, zoomWidth } = useConfigStore();
  const { state: interactionState } = useInteractionStore();

  const [isHovered, setIsHovered] = useState(false);
  const ganttBarRef = useRef<HTMLDivElement | null>(null);
  const startLeftPosition = useRef<number>(0);

  const durationBarWidth = calculateDurationBetweenDate(row.start, row.end);
  const width = durationBarWidth * (chartTimeFrameView.dayWidthUnit + zoomWidth);
  const positionLeft =
    calculateGanttBarPositionFromInitialStartingPoint(row.start, chartDateRange[0]) *
    (chartTimeFrameView.dayWidthUnit + zoomWidth);
  startLeftPosition.current = positionLeft;

  const progressDisplay = () => {
    if (row.currentProgress === undefined || row.maxProgress === undefined) return '';

    return progressFormatter(
      row.currentProgress,
      row.maxProgress,
      {
        comma: true,
        decimal: row.progressIndicatorLabel?.decimal ?? 2,
        prefix: row.progressIndicatorLabel?.prefix ?? '',
        suffix: row.progressIndicatorLabel?.suffix ?? '',
      },
      row.progressIndicatorLabelFormatter, // Custom formatter
    );
  };

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

  return (
    <GanttBarErrorBoundary>
      <div
        ref={ganttBarRef}
        data-bar-id={row.id.toString()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role='button'
        aria-label={`GanttBar: ${row.name}`}
        className='gantt-bar'
        style={{
          top: `${index * 41}px`,
          left: `${positionLeft}px`,
          width: `${width}px`,
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
          <BarDragDropHandler
            index={index}
            row={row}
            startLeftPosition={startLeftPosition}
            ganttBarRef={ganttBarRef}
            getSelectedRow={getSelectedRow}
          />
          <BarResizer position='left' row={row} width={width} ganttBarRef={ganttBarRef} startLeftPosition={startLeftPosition} />
          <BarResizer position='right' row={row} width={width} ganttBarRef={ganttBarRef} startLeftPosition={startLeftPosition} />
          <div className='gantt-bar-text-cell'>
            <p className='gantt-bar-text' title={row.name}>
              {row.name}
            </p>
            {row.showProgressIndicator?.showLabel && <span className='gnatt-bar-progress-text'>{progressDisplay()}</span>}
          </div>
        </div>
      </div>
    </GanttBarErrorBoundary>
  );
};

// Use memo to prevent unnecessary rerenders
export default memo(GanttBar);
