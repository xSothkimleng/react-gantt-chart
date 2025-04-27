import { memo, useState, useCallback } from 'react';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useUIStore } from '../../../../../stores/useUIStore';
import { Row } from '../../../../../types/row';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../../assets/icons/icons';
import { useShallow } from 'zustand/shallow';
// import { useShallow } from 'zustand/shallow';

const progressDisplay = (row: Row) => {
  return row.progressIndicatorLabel ?? '';
};

const renderRowContent = (row: Row, key: string) => {
  if (key === 'name' && row.showProgressIndicator?.showLabelOnSideBar) {
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
  // Get specific row data by ID
  const row = useRowsStore(useShallow(state => state.getRowById(String(rowId))));

  // Get child IDs for this row
  const childIds = useRowsStore(useShallow(state => state.parentChildMap[String(rowId)] || []));

  // Get collapsed state only for this specific row
  const isCollapsed = useRowsStore(state => state.collapsedItems.has(String(rowId)));
  const toggleCollapse = useRowsStore(state => state.toggleCollapse);

  // Get UI elements from uiStore
  const externalGetSelectedRow = useUIStore(state => state.externalGetSelectedRow);
  const ButtonContainer = useUIStore(state => state.ButtonContainer);

  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  // Create a memoized handler for row selection
  const handleRowSelect = useCallback(() => {
    if (externalGetSelectedRow && row) {
      externalGetSelectedRow(row);
    }
  }, [externalGetSelectedRow, row]);

  const handleMouseEnter = useCallback(() => {
    if (row) setHoveredRowId(String(row.id));
  }, [row]);

  const handleMouseLeave = useCallback(() => {
    setHoveredRowId(null);
  }, []);

  const handleToggleCollapse = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleCollapse(String(rowId));
    },
    [rowId, toggleCollapse],
  );

  if (!row) return null;

  // Check if this row has children using the childIds
  const hasChildren = childIds.length > 0;

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
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className='gantt-data-panel-row-cell'
            style={{
              paddingLeft: key === 'name' ? `${depth * 20}px` : '10px',
              fontWeight: row.highlight ? 'bold' : 'normal',
            }}>
            {key === 'name' && hasChildren && (
              <button className='gantt-data-panel-collapse-button' onClick={handleToggleCollapse}>
                {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
              </button>
            )}
            <p className='gantt-data-panel-row-cell-content'>{renderRowContent(row, key)}</p>
            {key === 'name' && ButtonContainer && hoveredRowId === String(row.id) && (
              <div className='gantt-data-panel-row-cell-action-buttons'>
                <ButtonContainer />
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Render children only if not collapsed and there are children */}
      {hasChildren &&
        !isCollapsed &&
        childIds.map(childId => (
          <DataRow
            key={childId}
            rowId={childId}
            depth={depth + 1}
            gridTemplateColumns={gridTemplateColumns}
            visibleFields={visibleFields}
          />
        ))}
    </div>
  );
};

export default memo(DataRow);
