import { Row } from '../types/row';
import { normalizeId } from './normalizeId';

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
