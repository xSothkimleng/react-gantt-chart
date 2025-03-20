import GanttChartTimelinePanel from './GanttChartTimelinePanel';
import GanttChartDataRowPanel from './GanttChartDataRowPanel';
import '../../styles/theme.css';

interface GanttChartContentProps {
  showSidebar: boolean;
  className?: string;
}

const GanttChartContent: React.FC<GanttChartContentProps> = ({ showSidebar, className = '' }) => {
  return (
    <div className={`gantt-chart-container ${className}`}>
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'grid',
          gridTemplateColumns: showSidebar ? '0.2fr 1fr' : '0fr 1fr',
          borderBottom: '0px solid gray',
          transition: 'grid-template-columns var(--gantt-transition-duration)',
        }}>
        <GanttChartDataRowPanel className={`${className}-data-panel`} />
        <GanttChartTimelinePanel />
      </div>
    </div>
  );
};

export default GanttChartContent;
