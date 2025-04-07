// For GanttBarPanelRowTree/index.tsx
import React, { useMemo } from 'react';
import GanttBar from '../GanttBar';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useShallow } from 'zustand/shallow';

const GanttBarPanelRowTree = () => {
  // Get only the IDs and structure, not the entire row data
  const rootIds = useRowsStore(useShallow(state => state.rootIds));
  const parentChildMap = useRowsStore(useShallow(state => state.parentChildMap));
  const collapsedItems = useRowsStore(useShallow(state => state.collapsedItems));

  // Memoize the tree rendering logic
  const renderedTree = useMemo(() => {
    if (rootIds.length === 0) return null;

    let currentIndex = 0;

    const renderRowById = (id: string) => {
      const rowIndex = currentIndex++;
      const isCollapsed = collapsedItems.has(id);
      const childIds = parentChildMap[id] || [];

      return (
        <div key={id} style={{ position: 'absolute' }}>
          {/* Pass only the ID, not the entire row object */}
          <GanttBar index={rowIndex} rowId={id} />

          {/* Render children only if not collapsed and children exist */}
          {!isCollapsed && childIds.length > 0 && childIds.map(childId => renderRowById(childId))}
        </div>
      );
    };

    return rootIds.map(id => renderRowById(id));
  }, [rootIds, parentChildMap, collapsedItems]);

  return renderedTree;
};

export default React.memo(GanttBarPanelRowTree);
