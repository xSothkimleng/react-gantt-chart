import React, { useEffect } from 'react';
import GanttChartTimelinePanel from './GanttChartTimelinePanel';
import GanttChartDataRowPanel from './GanttChartDataRowPanel';
import { useUIStore } from '../../stores/useUIStore';
import '../../styles/theme.css';

interface GanttChartContentProps {
  showSidebar: boolean;
  className?: string;
}

const GanttChartContent: React.FC<GanttChartContentProps> = ({ showSidebar, className = '' }) => {
  // Use the prop to update the store
  useEffect(() => {
    useUIStore.setState({ showSidebar });
  }, [showSidebar]);

  // We now read showSidebar from the store to ensure consistency
  const isSidebarVisible = useUIStore(state => state.showSidebar);

  return (
    <div className={`gantt-chart-container ${className}`}>
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'grid',
          borderBottom: '0px solid var(--gantt-global-border-color)',
          gridTemplateColumns: isSidebarVisible ? 'var(--gantt-sidebar-width-fr) var(--gantt-timeline-width-fr)' : '0fr 1fr',
          transition: 'grid-template-columns var(--gantt-sidebar-transition-duration)',
        }}>
        <GanttChartDataRowPanel />
        <GanttChartTimelinePanel />
      </div>
    </div>
  );
};

export default React.memo(GanttChartContent);
