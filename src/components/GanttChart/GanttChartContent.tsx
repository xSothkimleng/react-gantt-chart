import React from 'react';
import GanttChartTimelinePanel from './GanttChartTimelinePanel';
import GanttChartDataRowPanel from './GanttChartDataRowPanel';
import { useGanttChartStore } from '../../stores/GanttChartStore';
import './styles.css';
import '../../styles/theme.css';
import LoadingSpinner from '../Loading/spinner';

interface GanttChartContentProps {
  className?: string;
}

const GanttChartContent: React.FC<GanttChartContentProps> = ({ className = '' }) => {
  const isShowSidebar = useGanttChartStore(state => state.showSidebar);
  // const isLoading = useGanttChartStore(state => state.isLoading);
  const isLoading = false;

  return (
    <div className={`gantt-chart-container ${className}`}>
      {isLoading ? (
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.05)',
            overflow: 'hidden',
            zIndex: '999',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LoadingSpinner />
        </div>
      ) : (
        <div
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
            display: 'grid',
            borderBottom: '1px solid var(--gantt-global-border-color)',
            gridTemplateColumns: isShowSidebar ? 'var(--gantt-sidebar-width-fr) var(--gantt-timeline-width-fr)' : '0fr 1fr',
            transition: 'grid-template-columns var(--gantt-sidebar-transition-duration)',
          }}>
          <GanttChartDataRowPanel />
          <GanttChartTimelinePanel />
        </div>
      )}
    </div>
  );
};

export default React.memo(GanttChartContent);
