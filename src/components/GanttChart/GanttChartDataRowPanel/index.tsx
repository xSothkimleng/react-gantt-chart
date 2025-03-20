import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '../../../assets/icons/icons';
import { useGanttChart } from '../../../context/GanttChartContext';
import { Row } from '../../../types/row';
import { progressFormatter } from '../../../utils/progressFormater';

import './styles.css';

interface GanttChartDataRowPanelProps {
  className?: string;
}

const GanttChartDataRowPanel: React.FC<GanttChartDataRowPanelProps> = ({ className = '' }) => {
  const { allRow, columnSetting, getSelectedRow, collapsedItems, toggleCollapse, ButtonContainer } = useGanttChart();

  const getColumnWidth = (key: string) => {
    switch (key) {
      case 'id':
        return '50px';
      case 'name':
        return 'minmax(200px, 1.5fr)';
      default:
        return 'minmax(120px, 1fr)';
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const visibleFields = columnSetting ? Object.entries(columnSetting).filter(([_, field]) => field.show) : [];
  const gridTemplateColumns = visibleFields.map(([key]) => getColumnWidth(key)).join(' ');
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  const progressDisplay = (row: Row) => {
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
      row.progressIndicatorLabelFormatter,
    );
  };

  const renderRowContent = (row: Row, key: string) => {
    if (key === 'name' && row.showProgressIndicator?.showLabel) {
      return `${String(row[key] || '')}${progressDisplay(row)}`;
    }
    return String(row[key as keyof typeof row] || '');
  };

  const renderRow = (row: Row, depth: number = 0) => {
    const hasChildren = Array.isArray(row.children) && (row.children as Row[]).length > 0;
    const isCollapsed = collapsedItems.has(row.id.toString());

    return (
      <div key={row.id}>
        <div
          className='gantt-data-panel-row-container'
          style={{
            gridTemplateColumns,
          }}>
          {visibleFields.map(([key], index) => (
            <div
              key={`${row.id}-${row.name}-${index}`}
              onClick={() => getSelectedRow && getSelectedRow(row)}
              onMouseEnter={() => setHoveredRowId(row.id.toString())}
              onMouseLeave={() => setHoveredRowId(null)}
              className='gantt-data-panel-row-cell'
              style={{
                paddingLeft: key === 'name' ? `${depth * 20}px` : '10px',
                fontWeight: row.highlight ? 'bold' : 'normal',
                cursor: getSelectedRow ? 'pointer' : 'default',
              }}>
              {key === 'name' && hasChildren && (
                <button
                  className='gantt-data-panel-collapse-button '
                  onClick={e => {
                    e.stopPropagation();
                    toggleCollapse(row.id.toString());
                  }}>
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                </button>
              )}
              <p className='gantt-data-panel-row-cell-content'>{renderRowContent(row, key)}</p>
              {key === 'name' && ButtonContainer && hoveredRowId === row.id.toString() && (
                <div className='gantt-data-panel-row-cell-action-buttons'>
                  <ButtonContainer />
                </div>
              )}
            </div>
          ))}
        </div>
        {hasChildren && !isCollapsed && row.children && row.children.map(childRow => renderRow(childRow, depth + 1))}
      </div>
    );
  };

  return (
    <div className={`gantt-data-panel ${className}`}>
      {/* Table Header */}
      <div
        className='gantt-data-panel-header'
        style={{
          gridTemplateColumns,
        }}>
        {visibleFields.map(([key, field]) => (
          <div key={key} className='gantt-data-panel-header-cell'>
            <p className='gantt-data-panel-header-cell-content '>{field.name}</p>
          </div>
        ))}
      </div>

      {/* Table Content */}
      <div>
        {allRow.length === 0 ? (
          <div
            style={{
              gridColumn: `span ${visibleFields.length}`,
              textAlign: 'center',
              borderTop: '1px solid lightgray',
            }}>
            No Data
          </div>
        ) : (
          allRow.map(row => renderRow(row))
        )}
      </div>
    </div>
  );
};

export default GanttChartDataRowPanel;
