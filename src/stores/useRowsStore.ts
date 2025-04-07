import { create } from 'zustand';
import { Row } from '../types/row';
// import { updateNestedRowById } from '../utils/rowUtils';

type RowsState = {
  // granular approach
  rowsById: Record<string, Row>;
  rootIds: string[];
  parentChildMap: Record<string, string[]>;
  getAllRows: () => Row[];
  setRows: (rows: Row[]) => void;
  getRowsCount: () => number;
  getDateBoundaries: () => { earliest: Date; latest: Date };
  findEarliestRow: () => Row | undefined;

  // State
  rows: Row[];
  collapsedItems: Set<string>;

  // Actions
  // setRows: (rows: Row[]) => void;
  updateRow: (rowId: string | number, updateFn: (row: Row) => Row) => void;
  toggleCollapse: (itemId: string) => void;

  // Selectors
  getRowById: (rowId: string | number) => Row | undefined;
  getVisibleRows: () => Row[]; // Returns only non-collapsed rows
};

export const useRowsStore = create<RowsState>((set, get) => ({
  // new approach
  rowsById: {},
  rootIds: [],
  parentChildMap: {},

  // State
  rows: [],
  collapsedItems: new Set<string>(),

  // Actions
  // setRows: rows => set({ rows }),
  setRows: rows => {
    const rowsById: Record<string, Row> = {};
    const rootIds: string[] = [];
    const parentChildMap: Record<string, string[]> = {};

    // Helper function to process rows recursively
    const processRow = (row: Row, parentId?: string) => {
      const id = String(row.id);

      // Clone row without the children property to avoid circular references
      const { children, ...rowWithoutChildren } = row;
      rowsById[id] = rowWithoutChildren as Row;

      if (parentId) {
        // Add to parent's children list
        if (!parentChildMap[parentId]) {
          parentChildMap[parentId] = [];
        }
        parentChildMap[parentId].push(id);
      } else {
        // This is a root row
        rootIds.push(id);
      }

      // Process children recursively
      if (children && children.length > 0) {
        children.forEach(child => processRow(child, id));
      }
    };

    // Process all rows
    rows.forEach(row => processRow(row));

    set({ rowsById, rootIds, parentChildMap });
  },

  // updateRow: (rowId, updateFn) =>
  //   set(state => ({
  //     rows: updateNestedRowById(state.rows, rowId, updateFn),
  //   })),
  updateRow: (rowId, updateFn) => {
    const id = String(rowId);
    const row = get().rowsById[id];

    if (row) {
      set(state => ({
        rowsById: {
          ...state.rowsById,
          [id]: updateFn(row),
        },
      }));
    }
  },

  toggleCollapse: itemId => {
    set(state => {
      const newCollapsedItems = new Set(state.collapsedItems);
      if (newCollapsedItems.has(itemId)) {
        newCollapsedItems.delete(itemId);
      } else {
        newCollapsedItems.add(itemId);
      }
      return { collapsedItems: newCollapsedItems };
    });
  },

  // Selectors
  // getRowById: rowId => {
  //   const rows = get().rows;
  //   const findRowById = (rows: Row[], id: string | number): Row | undefined => {
  //     for (const row of rows) {
  //       if (row.id === id) {
  //         return row;
  //       }
  //       if (row.children) {
  //         const foundRow = findRowById(row.children, id);
  //         if (foundRow) {
  //           return foundRow;
  //         }
  //       }
  //     }
  //     return undefined;
  //   };
  //   return findRowById(rows, rowId);
  // },
  getRowById: rowId => {
    return get().rowsById[String(rowId)];
  },

  getVisibleRows: () => {
    return get().rows;
  },

  getAllRows: () => {
    const { rowsById, rootIds, parentChildMap } = get();

    // Reconstruct the nested structure for compatibility
    const buildRowHierarchy = (ids: string[]): Row[] => {
      return ids.map(id => {
        const row = { ...rowsById[id] };
        const childIds = parentChildMap[id];

        if (childIds && childIds.length > 0) {
          row.children = buildRowHierarchy(childIds);
        }

        return row;
      });
    };

    return buildRowHierarchy(rootIds);
  },

  // more new approach
  getDateBoundaries: () => {
    const { rowsById } = get();
    if (Object.keys(rowsById).length === 0) {
      return { earliest: new Date(), latest: new Date() };
    }

    const allDates = Object.values(rowsById).flatMap(row => [new Date(row.start), new Date(row.end)]);
    return {
      earliest: new Date(Math.min(...allDates.map(date => date.getTime()))),
      latest: new Date(Math.max(...allDates.map(date => date.getTime()))),
    };
  },

  getRowsCount: () => {
    return Object.keys(get().rowsById).length;
  },

  findEarliestRow: () => {
    const { rowsById } = get();
    if (Object.keys(rowsById).length === 0) return undefined;

    let earliestDate = new Date();
    let earliestRowId = '';

    Object.entries(rowsById).forEach(([id, row]) => {
      const startDate = new Date(row.start);
      if (!earliestRowId || startDate < earliestDate) {
        earliestDate = startDate;
        earliestRowId = id;
      }
    });

    return earliestRowId ? rowsById[earliestRowId] : undefined;
  },
}));
