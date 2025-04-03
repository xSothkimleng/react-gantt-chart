// For GanttBarPanelRowTree/index.tsx
import React, { useMemo } from 'react';
import GanttBar from '../GanttBar';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { Row } from '../../../../../types/row';
import { useShallow } from 'zustand/shallow';

const GanttBarPanelRowTree = () => {
  const rows = useRowsStore(useShallow(state => state.rows));
  const collapsedItems = useRowsStore(useShallow(state => state.collapsedItems));

  // Memoize the entire tree structure to prevent unnecessary re-renders
  const renderedTree = useMemo(() => {
    if (rows.length === 0) return null;

    let currentIndex = 0;

    const renderRow = (row: Row) => {
      const rowIndex = currentIndex++;
      const isCollapsed = collapsedItems.has(row.id.toString());

      return (
        <div key={row.id.toString()}>
          <GanttBar index={rowIndex} rowId={row.id} />
          {row.children && !isCollapsed && row.children.map(childRow => renderRow(childRow))}
        </div>
      );
    };

    return rows.map(row => renderRow(row));
  }, [rows, collapsedItems]);

  return renderedTree;
};

export default React.memo(GanttBarPanelRowTree);
