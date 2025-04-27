import React from 'react';
import GanttChartTimelinePanel from './GanttChartTimelinePanel';
import GanttChartDataRowPanel from './GanttChartDataRowPanel';
import '../../styles/theme.css';
import { useConfigStore } from '../../stores/useConfigStore';

interface GanttChartContentProps {
  className?: string;
}

const GanttChartContent: React.FC<GanttChartContentProps> = ({ className = '' }) => {
  const isShowSidebar = useConfigStore(state => state.showSidebar);

  return (
    <div className={`gantt-chart-container ${className}`}>
      <div
        style={{
          position: 'relative',
          height: '100%',
          // minHeight: 'calc(100vh - var(--gantt-header-height))',
          width: '100%',
          display: 'grid',
          borderBottom: '0px solid var(--gantt-global-border-color)',
          gridTemplateColumns: isShowSidebar ? 'var(--gantt-sidebar-width-fr) var(--gantt-timeline-width-fr)' : '0fr 1fr',
          transition: 'grid-template-columns var(--gantt-sidebar-transition-duration)',
        }}>
        <GanttChartDataRowPanel />
        <GanttChartTimelinePanel />
      </div>
    </div>
  );
};

export default React.memo(GanttChartContent);
