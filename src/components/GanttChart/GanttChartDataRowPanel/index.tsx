import React, { useCallback, useEffect, useRef } from 'react';
import './styles.css';
import { useConfigStore } from '../../../stores/useConfigStore';
import DataRowTree from './RowTree';
import { useUIStore } from '../../../stores/useUIStore';

const GanttChartDataRowPanel = React.memo(() => {
  // Get columns from configStore
  const columns = useConfigStore(state => state.columns);

  // Create ref for data panel
  const dataPanelRef = useRef<HTMLDivElement>(null);

  // Get refs and scroll state from UI store
  const timelinePanelRef = useUIStore(state => state.timelinePanelRef);
  const setDataPanelRef = useUIStore(state => state.setDataPanelRef);
  const isProgrammaticScroll = useUIStore(state => state.isProgrammaticScroll);
  const setIsProgrammaticScroll = useUIStore(state => state.setIsProgrammaticScroll);

  // Set the ref in the UI store when the component mounts
  useEffect(() => {
    setDataPanelRef(dataPanelRef);
  }, [setDataPanelRef]);

  // Direct DOM event listener for vertical scrolling
  useEffect(() => {
    const panel = dataPanelRef.current;
    if (!panel) return;

    const handlePanelScroll = () => {
      // Don't process if we're programmatically scrolling
      if (isProgrammaticScroll) return;

      const currentScrollTop = panel.scrollTop;

      if (timelinePanelRef?.current) {
        setIsProgrammaticScroll(true);
        timelinePanelRef.current.scrollTop = currentScrollTop;
        setTimeout(() => setIsProgrammaticScroll(false), 50);
      }
    };

    // Use direct DOM event listener for more reliable behavior
    panel.addEventListener('scroll', handlePanelScroll);

    return () => {
      panel.removeEventListener('scroll', handlePanelScroll);
    };
  }, [timelinePanelRef, isProgrammaticScroll, setIsProgrammaticScroll]);

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

  return (
    <div
      ref={dataPanelRef}
      className='gantt-data-panel'
      style={{
        overflow: 'auto', // Make sure both horizontal and vertical scrolling are enabled
        height: '100%', // Ensure full height
      }}>
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
