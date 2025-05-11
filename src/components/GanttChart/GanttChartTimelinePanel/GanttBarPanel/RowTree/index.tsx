import React, { useMemo } from 'react';
import GanttBar from '../GanttBar';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useConfigStore } from '../../../../../stores/useConfigStore';
import { useShallow } from 'zustand/shallow';
import TodayLine from '../TodayLine';
import './styles.css';

const GanttBarPanelRowTree = () => {
  // Get only the IDs and structure, not the entire row data
  const rootIds = useRowsStore(useShallow(state => state.rootIds));
  const parentChildMap = useRowsStore(useShallow(state => state.parentChildMap));
  const collapsedItems = useRowsStore(useShallow(state => state.collapsedItems));

  // Get the dayWidth from the config store
  const { chartTimeFrameView, zoomWidth } = useConfigStore(
    useShallow(state => ({
      chartTimeFrameView: state.chartTimeFrameView,
      zoomWidth: state.zoomWidth,
    })),
  );

  // Memoize dayWidth calculation
  const dayWidth = useMemo(() => {
    return chartTimeFrameView.dayWidthUnit + zoomWidth;
  }, [chartTimeFrameView.dayWidthUnit, zoomWidth]);

  // Create a memoized background style for the grid
  const backgroundStyle: React.CSSProperties = useMemo(() => {
    return {
      background: `repeating-linear-gradient(
        to right,
        transparent,
        transparent ${dayWidth - 1}px,
        rgba(0,0,0,0.05) ${dayWidth - 1}px,
        rgba(0,0,0,0.05) ${dayWidth}px
      )`,
      position: 'relative',
      width: '100%',
      height: '1000%',
      // overflow: 'hidden',
    };
  }, [dayWidth]);

  // Memoize the tree rendering logic
  const renderedTree = useMemo(() => {
    if (rootIds.length === 0) return null;

    let currentIndex = 0;

    const renderRowById = (id: string) => {
      const rowIndex = currentIndex++;
      const isCollapsed = collapsedItems.has(id);
      const childIds = parentChildMap[id] || [];

      return (
        <div key={id}>
          {/* Pass only the ID, not the entire row object */}
          <GanttBar index={rowIndex} rowId={id} />

          {/* Render children only if not collapsed and children exist */}
          {!isCollapsed && childIds.length > 0 && childIds.map(childId => renderRowById(childId))}
        </div>
      );
    };

    return rootIds.map(id => renderRowById(id));
  }, [rootIds, parentChildMap, collapsedItems]);

  return (
    <div style={backgroundStyle} className='gantt-bar-tree-container'>
      {renderedTree}
      <TodayLine />
    </div>
  );
};

export default React.memo(GanttBarPanelRowTree);
