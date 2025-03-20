import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '../../../assets/icons/icons';
import { useGanttChart } from '../../../context/GanttChartContext';
import { Row } from '../../../types/row';
import { progressFormatter } from '../../../utils/progressFormater';

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
          style={{
            display: 'grid',
            gridTemplateColumns,
            borderBottom: '1px solid lightgray',
            minWidth: 'max-content',
            overflow: 'hidden',
          }}>
          {visibleFields.map(([key], index) => (
            <div
              key={`${row.id}-${row.name}-${index}`}
              onClick={() => getSelectedRow && getSelectedRow(row)}
              onMouseEnter={() => setHoveredRowId(row.id.toString())}
              onMouseLeave={() => setHoveredRowId(null)}
              style={{
                position: 'relative',
                borderLeft: '1px solid lightgray',
                height: '40px',
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                padding: '0 10px',
                paddingLeft: key === 'name' ? `${depth * 20}px` : '10px',
                fontSize: '0.8em',
                fontWeight: row.highlight ? 'bold' : 'normal',
                cursor: getSelectedRow ? 'pointer' : 'default',
              }}>
              {key === 'name' && hasChildren && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    toggleCollapse(row.id.toString());
                  }}
                  style={{
                    marginRight: '8px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    flexShrink: 0,
                  }}>
                  {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
                </button>
              )}
              <p
                style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  margin: '0',
                  width: '100%',
                }}>
                {renderRowContent(row, key)}
              </p>
              {key === 'name' && ButtonContainer && hoveredRowId === row.id.toString() && (
                <div
                  style={{
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
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
    <div
      className={`gantt-data-panel ${className}`}
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        overflowX: 'scroll',
        overflowY: 'hidden',
        height: '100%',
        borderRight: '1px solid lightgray',
        borderTop: '1px solid lightgray',
      }}>
      {/* Table Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns,
          borderBottom: '1px solid lightgray',
          height: '49px',
          background: '#f0f0f0',
          minWidth: 'max-content',
        }}>
        {visibleFields.map(([key, field]) => (
          <div
            key={key}
            style={{
              fontWeight: '600',
              textAlign: 'left',
              borderLeft: '1px solid lightgray',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: '0.8em',
              overflow: 'hidden',
            }}>
            <p
              style={{
                padding: '0',
                margin: '0',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
              }}>
              {field.name}
            </p>
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
