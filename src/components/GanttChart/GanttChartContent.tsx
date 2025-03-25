// src/components/GanttChart/GanttChartContent.tsx
import GanttChartTimelinePanel from './GanttChartTimelinePanel';
import GanttChartDataRowPanel from './GanttChartDataRowPanel';
import '../../styles/theme.css';
import { Column } from '../../types/column';
import { Row } from '../../types/row';

interface GanttChartContentProps {
  showSidebar: boolean;
  className?: string;
  columnSetting?: Column;
  getSelectedRow?: (row: Row) => void;
  ButtonContainer?: React.FC;
}

const GanttChartContent: React.FC<GanttChartContentProps> = ({
  showSidebar,
  className = '',
  columnSetting,
  getSelectedRow,
  ButtonContainer,
}) => {
  return (
    <div className={`gantt-chart-container ${className}`}>
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'grid',
          borderBottom: '0px solid var(--gantt-global-border-color)',
          gridTemplateColumns: showSidebar ? 'var(--gantt-sidebar-width-fr) var(--gantt-timeline-width-fr)' : '0fr 1fr',
          transition: 'grid-template-columns var(--gantt-sidebar-transition-duration)',
        }}>
        <GanttChartDataRowPanel columnSetting={columnSetting} getSelectedRow={getSelectedRow} ButtonContainer={ButtonContainer} />
        <GanttChartTimelinePanel />
      </div>
    </div>
  );
};

export default GanttChartContent;
