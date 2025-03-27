/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useCallback } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '../../../assets/icons/icons';
import { Row } from '../../../types/row';
import { progressFormatter } from '../../../utils/progressFormater';
import { useGanttChartStore } from '../../../stores/GanttChartStore';
import './styles.css';

const GanttChartDataRowPanel = React.memo(() => {
  const columns = useGanttChartStore(state => state.columns);
  const rows = useGanttChartStore(state => state.rows);
  const collapsedItems = useGanttChartStore(state => state.collapsedItems);
  const toggleCollapse = useGanttChartStore(state => state.toggleCollapse);
  const ButtonContainer = useGanttChartStore(state => state.ButtonContainer);
  const selectRow = useGanttChartStore(state => state.externalGetSelectedRow);

  const getColumnWidth = useCallback((key: string) => {
    switch (key) {
      case 'id':
        return '50px';
      case 'name':
        return 'minmax(200px, 1.5fr)';
      default:
        return 'minmax(120px, 1fr)';
    }
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const visibleFields = columns ? Object.entries(columns).filter(([_, field]) => field.show) : [];
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
              key={`${row.id}-${key}-${index}`}
              onClick={() => selectRow && selectRow(row)}
              onMouseEnter={() => setHoveredRowId(row.id.toString())}
              onMouseLeave={() => setHoveredRowId(null)}
              className='gantt-data-panel-row-cell'
              style={{
                paddingLeft: key === 'name' ? `${depth * 20}px` : '10px',
                fontWeight: row.highlight ? 'bold' : 'normal',
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
    <div className='gantt-data-panel'>
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
        {rows.length === 0 ? (
          <div
            style={{
              gridColumn: `span ${visibleFields.length}`,
              textAlign: 'center',
              borderTop: '1px solid lightgray',
            }}>
            No Data
          </div>
        ) : (
          rows.map(row => renderRow(row))
        )}
      </div>
    </div>
  );
});

export default GanttChartDataRowPanel;
