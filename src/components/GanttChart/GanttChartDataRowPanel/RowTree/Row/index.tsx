import { memo, useState } from 'react';
import { useRowsStore } from '../../../../../stores/useRowsStore'; // Changed
import { useUIStore } from '../../../../../stores/useUIStore'; // Added
import { Row } from '../../../../../types/row';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../../assets/icons/icons';
import { useShallow } from 'zustand/shallow'; // Added for optimization

const progressDisplay = (row: Row) => {
  return row.progressIndicatorLabel ?? '';
};

const renderRowContent = (row: Row, key: string) => {
  if (key === 'name' && row.showProgressIndicator?.showLabel) {
    return `${String(row[key] || '')}${progressDisplay(row)}`;
  }
  return String(row[key as keyof typeof row] || '');
};

type DataRowType = {
  rowId: string | number;
  depth?: number;
  gridTemplateColumns: string;
  visibleFields: [string, { name: string; show: boolean }][];
};

const DataRow: React.FC<DataRowType> = ({ rowId, depth = 0, gridTemplateColumns, visibleFields }) => {
  // Get row data from rowsStore
  const row = useRowsStore(state => state.getRowById(rowId));

  // Get collapsed state from rowsStore
  const collapsedItems = useRowsStore(useShallow(state => state.collapsedItems));
  const toggleCollapse = useRowsStore(state => state.toggleCollapse);

  // Get UI elements from uiStore
  const externalGetSelectedRow = useUIStore(state => state.externalGetSelectedRow);
  const ButtonContainer = useUIStore(state => state.ButtonContainer);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  if (!row) return null;

  const hasChildren = Array.isArray(row.children) && (row.children as Row[]).length > 0;
  const isCollapsed = collapsedItems.has(row.id.toString());

  // Create a memoized handler for row selection
  const handleRowSelect = () => {
    if (externalGetSelectedRow) {
      externalGetSelectedRow(row);
    }
  };

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
            onClick={handleRowSelect}
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
      {hasChildren &&
        !isCollapsed &&
        row.children &&
        row.children.map(childRow => (
          <DataRow
            key={childRow.id}
            rowId={childRow.id}
            depth={depth + 1}
            gridTemplateColumns={gridTemplateColumns}
            visibleFields={visibleFields}
          />
        ))}
    </div>
  );
};

export default memo(DataRow);
