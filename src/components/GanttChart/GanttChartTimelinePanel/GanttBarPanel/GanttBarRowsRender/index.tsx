// src/components/GanttChart/GanttChartTimelinePanel/GanttBarPanel/GanttBarRowsRender.tsx
import React, { memo, useMemo } from 'react';
import { useGanttChartStore } from '../../../../../stores/GanttChartStore';
import GanttBar from './GanttBar';
import { findRowById } from '../../../../../utils/ganttBarUtils';
import { Row } from '../../../../../types/row';

interface GanttBarRowsRenderProps {
  rowIds: (string | number)[];
  collapsedItems: Set<string>;
  depth?: number;
}

const GanttBarRowsRender = memo(({ rowIds, collapsedItems, depth = 0 }: GanttBarRowsRenderProps) => {
  // Create a stable string representation of all rows for memoization
  const rowsDataHash = useGanttChartStore(state => {
    // Using a simplified hash instead of the full data
    // This is a compromise between performance and correctness
    return state.rows.map(row => `${row.id}:${row.isLocked ? 1 : 0}`).join('|');
  });

  // Get all rows
  const allRows = useGanttChartStore(state => state.rows);

  // Create a map of row IDs to rows - memoized based on allRows and rowIds
  const rowsMap = useMemo(() => {
    const map = new Map<string | number, Row>();

    for (const id of rowIds) {
      const idStr = id.toString();
      // First try direct lookup
      const directRow = allRows.find(r => r.id.toString() === idStr);
      if (directRow) {
        map.set(id, directRow);
        continue;
      }

      // Then try deep lookup
      const foundRow = findRowById(allRows, id);
      if (foundRow) {
        map.set(id, foundRow);
      }
    }

    return map;
  }, [allRows, rowIds, rowsDataHash]); // Include rowsDataHash to refresh when rows change

  return (
    <>
      {rowIds.map((rowId, index) => {
        const row = rowsMap.get(rowId);
        if (!row) return null;

        const isCollapsed = collapsedItems.has(row.id.toString());
        const hasChildren = Array.isArray(row.children) && row.children.length > 0;

        return (
          <div key={row.id.toString()}>
            <GanttBar index={index} rowId={row.id} />

            {hasChildren && !isCollapsed && row.children && (
              <GanttBarRowsRender
                rowIds={row.children.map(child => child.id)}
                collapsedItems={collapsedItems}
                depth={depth + 1}
              />
            )}
          </div>
        );
      })}
    </>
  );
});

export default GanttBarRowsRender;
