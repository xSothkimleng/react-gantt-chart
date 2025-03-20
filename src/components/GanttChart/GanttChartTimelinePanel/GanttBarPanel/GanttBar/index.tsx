import React, { useRef, useState } from 'react';
import { useGanttChart } from '../../../../../context/GanttChartContext';
import BarResizer from './BarResizer';
import BarProgressIndicator from './BarProgressIndicator';
import BarDragDropHandler from './BarDragDropHandler';
import { Row } from '../../../../../types/row';
import {
  calculateDurationBetweenDate,
  calculateGanttBarPositionFromInitialStartingPoint,
} from '../../../../../utils/ganttBarUtils';
import { progressFormatter } from '../../../../../utils/progressFormater';

type GanttBarProps = {
  index: number;
  row: Row;
};

const GanttBar: React.FC<GanttBarProps> = ({ index, row }) => {
  const { chartTimeFrameView, chartDateRange, isLoading, interactionState, zoomWidth } = useGanttChart();
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
        comma: true, // Enable comma formatting
        decimal: row.progressIndicatorLabel?.decimal ?? 2, // Use specified decimal places (default: 2)
        prefix: row.progressIndicatorLabel?.prefix ?? '', // Optional currency prefix (e.g., "$")
        suffix: row.progressIndicatorLabel?.suffix ?? '', // Optional percentage suffix
      },
      row.progressIndicatorLabelFormatter, // Custom formatter (if defined)
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
        className='gantt-bar'
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role='button'
        aria-label={`GanttBar: ${row.name}`}
        aria-busy={isLoading}
        style={{
          position: 'absolute',
          top: `${index * 41}px`,
          left: `${positionLeft}px`,
          width: `${width}px`,
          height: '40px',
          cursor: interactionState.mode === 'barResizing' ? 'ew-resize' : 'grab',
          zIndex: 11,
          display: 'flex',
          alignItems: 'center',
          opacity: isHovered ? 0.9 : 1,
          transition: 'opacity 0.2s ease-in-out',
        }}>
        <div
          style={{
            position: 'relative',
            background: row.highlight ? '#32de84' : '#4169E1',
            color: 'white',
            borderRadius: '1px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            overflow: 'hidden',
            width: '100%',
            height: '30px',
            padding: '0 10px',
            boxShadow: isHovered ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
            transition: 'box-shadow 0.2s ease-in-out',
          }}>
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <>
              {row.showProgressIndicator?.showProgressBar && <BarProgressIndicator item={row} />}
              <BarDragDropHandler index={index} row={row} startLeftPosition={startLeftPosition} ganttBarRef={ganttBarRef} />
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
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  zIndex: 10,
                  flex: 1,
                  padding: '0 8px',
                  position: 'relative',
                }}>
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    userSelect: 'none',
                    fontSize: '0.9em',
                  }}
                  title={row.name}>
                  {row.name}
                </p>
                {row.showProgressIndicator?.showLabel && (
                  <span
                    style={{
                      fontSize: '0.9em',
                      whiteSpace: 'nowrap',
                    }}>
                    {progressDisplay()}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </GanttBarErrorBoundary>
  );
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default GanttBar;
