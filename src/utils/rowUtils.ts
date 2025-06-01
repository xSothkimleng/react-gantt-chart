import { Row } from '../types/row';
import { normalizeId } from './normalizeId';
import { useCallback } from 'react';
import { useRowsStore } from '../stores/useRowsStore';

// Helper function to update nested rows - moved from GanttChartProvider to utils
export const updateNestedRowById = (rows: Row[], rowId: string | number, updateFn: (rowItem: Row) => Row): Row[] => {
  const normalizedRowId = normalizeId(rowId);

  return rows.map(item => {
    // Convert current Row's ID to string for comparison
    if (normalizeId(item.id) === normalizedRowId) {
      return updateFn(item);
    }

    // If this row has children, recursively search them
    if (item.children && item.children.length > 0) {
      return {
        ...item,
        children: updateNestedRowById(item.children, normalizedRowId, updateFn),
      };
    }

    // Otherwise return the row unchanged
    return item;
  });
};

export const useRowCollapse = (row: Row) => {
  // Get collapse-related functions and state from the store
  const toggleCollapse = useRowsStore(state => state.toggleCollapse);
  const isCollapsed = useRowsStore(state => state.collapsedItems.has(String(row.id)));
  const childIds = useRowsStore(state => state.parentChildMap[String(row.id)] || []);

  // Check if this row has children
  const hasChildren = childIds.length > 0;

  // Memoized toggle handler
  const handleToggle = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation();
      }
      toggleCollapse(String(row.id));
    },
    [row.id, toggleCollapse],
  );

  // Collapse all children of this row
  const collapseAll = useCallback(() => {
    const collapseRecursively = (ids: string[]) => {
      ids.forEach(id => {
        const childChildren = useRowsStore.getState().parentChildMap[id] || [];
        if (childChildren.length > 0) {
          toggleCollapse(id);
          collapseRecursively(childChildren);
        }
      });
    };

    if (hasChildren) {
      collapseRecursively(childIds);
    }
  }, [childIds, hasChildren, toggleCollapse]);

  // Expand all children of this row
  const expandAll = useCallback(() => {
    const expandRecursively = (ids: string[]) => {
      ids.forEach(id => {
        const childChildren = useRowsStore.getState().parentChildMap[id] || [];
        if (childChildren.length > 0) {
          const isChildCollapsed = useRowsStore.getState().collapsedItems.has(id);
          if (isChildCollapsed) {
            toggleCollapse(id);
          }
          expandRecursively(childChildren);
        }
      });
    };

    if (hasChildren && isCollapsed) {
      handleToggle();
    }
    expandRecursively(childIds);
  }, [childIds, hasChildren, isCollapsed, handleToggle, toggleCollapse]);

  return {
    // State
    isCollapsed,
    hasChildren,
    childIds,
    childrenCount: childIds.length,

    // Actions
    toggle: handleToggle,
    collapse: () => !isCollapsed && handleToggle(),
    expand: () => isCollapsed && handleToggle(),
    collapseAll,
    expandAll,

    // Utilities
    toggleCollapse: useRowsStore.getState().toggleCollapse, // Export the raw function too
  };
};

/**
 * Standalone functions that can be imported and used anywhere
 * Useful for components that don't use the hook approach
 */
export const rowCollapseUtils = {
  /**
   * Toggle collapse state of a specific row
   */
  toggleRow: (rowId: string | number) => {
    useRowsStore.getState().toggleCollapse(String(rowId));
  },

  /**
   * Check if a row is collapsed
   */
  isRowCollapsed: (rowId: string | number) => {
    return useRowsStore.getState().collapsedItems.has(String(rowId));
  },

  /**
   * Get children IDs for a row
   */
  getRowChildren: (rowId: string | number) => {
    return useRowsStore.getState().parentChildMap[String(rowId)] || [];
  },

  /**
   * Check if a row has children
   */
  hasChildren: (rowId: string | number) => {
    const children = useRowsStore.getState().parentChildMap[String(rowId)] || [];
    return children.length > 0;
  },

  /**
   * Collapse all rows
   */
  collapseAllRows: () => {
    const state = useRowsStore.getState();
    const allParentIds = Object.keys(state.parentChildMap).filter(id => state.parentChildMap[id].length > 0);

    allParentIds.forEach(id => {
      if (!state.collapsedItems.has(id)) {
        state.toggleCollapse(id);
      }
    });
  },

  /**
   * Expand all rows
   */
  expandAllRows: () => {
    const state = useRowsStore.getState();
    const collapsedIds = Array.from(state.collapsedItems);

    collapsedIds.forEach(id => {
      state.toggleCollapse(id);
    });
  },
};
