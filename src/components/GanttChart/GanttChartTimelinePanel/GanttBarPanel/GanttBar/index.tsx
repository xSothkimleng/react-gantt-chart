import React, { useRef, useState } from 'react';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
import { Row } from '../../../../../types/row';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
} from '../../../../../utils/ganttBarUtils';
import { progressFormatter } from '../../../../../utils/progressFormater';
import { useInteractionStore } from '../../../../../stores/useInteractionStore';
import { useGanttChartStore } from '../../../../../stores/GanttChartStore';
import './styles.css';

type GanttBarProps = {
  index: number;
  row: Row;
};

const GanttBar: React.FC<GanttBarProps> = ({ index, row }) => {
  console.log('index', index);
  const isLoading = useGanttChartStore(state => state.isLoading);
  const chartTimeFrameView = useGanttChartStore(state => state.chartTimeFrameView);
  const zoomWidth = useGanttChartStore(state => state.zoomWidth);
  const chartDateRange = useGanttChartStore(state => state.chartDateRange);

  const interactionState = useInteractionStore(state => state.interactionState);

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

  // Loading Spinner Component
  const LoadingSpinner: React.FC = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
      }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          border: '2px solid #ffffff',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );

  return (
    <GanttBarErrorBoundary>
      <div
        ref={ganttBarRef}
        data-bar-id={row.id.toString()}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role='button'
        aria-label={`GanttBar: ${row.name}`}
        aria-busy={isLoading}
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
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {row.showProgressIndicator?.showProgressBar && <BarProgressIndicator item={row} />}
              <BarDragDropHandler index={index} row={row} startLeftPosition={startLeftPosition} ganttBarRef={ganttBarRef} />
              {/* <BarResizer
                position='left'
                row={row}
                width={width}
                ganttBarRef={ganttBarRef}
                startLeftPosition={startLeftPosition}
              /> */}
              <BarResizer
                position='right'
                row={row}
                width={width}
                ganttBarRef={ganttBarRef}
                startLeftPosition={startLeftPosition}
              />
              <div className='gantt-bar-text-cell'>
                <p className='gantt-bar-text' title={row.name}>
                  {row.name}
                </p>
                {row.showProgressIndicator?.showLabel && <span className='gnatt-bar-progress-text'>{progressDisplay()}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </GanttBarErrorBoundary>
  );
};

export default React.memo(GanttBar);
