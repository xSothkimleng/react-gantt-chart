/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback } from 'react';
import './styles.css';
import { useGanttChartStore } from '../../../stores/useGanttChartStore';
import DataRowTree from './RowTree';

const GanttChartDataRowPanel = React.memo(() => {
  const columns = useGanttChartStore(state => state.columns);

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

  const visibleFields = columns ? Object.entries(columns).filter(([_, field]) => field.show) : [];
  const gridTemplateColumns = visibleFields.map(([key]) => getColumnWidth(key)).join(' ');

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
      <DataRowTree visibleFields={visibleFields} gridTemplateColumns={gridTemplateColumns} />
    </div>
  );
});

export default GanttChartDataRowPanel;
