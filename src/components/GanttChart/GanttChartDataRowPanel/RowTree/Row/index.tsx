import { memo, useState, useCallback } from 'react';
import { useRowsStore } from '../../../../../stores/useRowsStore';
import { useUIStore } from '../../../../../stores/useUIStore';
import { Row } from '../../../../../types/row';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../../assets/icons/icons';
import { useShallow } from 'zustand/shallow';
import { useConfigStore } from '../../../../../stores/useConfigStore';
// import { scrollToGanttBar } from '../../../../../utils/scrollUtils';

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
  const isCompactView = useConfigStore(state => state.isCompactView);

  // Get specific row data by ID
  const row = useRowsStore(useShallow(state => state.getRowById(String(rowId))));

  // Get child IDs for this row
  const childIds = useRowsStore(useShallow(state => state.parentChildMap[String(rowId)] || []));

  // Get UI elements from uiStore
  const externalGetSelectedRow = useUIStore(state => state.externalGetSelectedRow);
  const ButtonContainer = useUIStore(state => state.ButtonContainer);
  const rowCustomComponent = useUIStore(state => state.rowCustomComponent);
  const rowHeight = useUIStore(state => state.rowHeight);

  // Get collapsed state only for this specific row
  const isCollapsed = useRowsStore(state => state.collapsedItems.has(String(rowId)));
  const toggleCollapse = useRowsStore(state => state.toggleCollapse);

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

  // Updated scroll handler using the exported function
  // const handleScrollToGanttBar = useCallback(async (row: Row) => {
  //   const success = await scrollToGanttBar(row, {
  //     offset: 50,
  //     behavior: 'smooth',
  //   });

  //   if (success) {
  //     console.log('Scrolled to Gantt Bar:', row.name);
  //   } else {
  //     console.warn('Failed to scroll to Gantt bar for:', row.name);
  //   }
  // }, []);

  if (!row) return null;

  const hasChildren = childIds.length > 0;

  // Determine background color based on whether row has children
  const getRowBackgroundColor = () => {
    if (!hasChildren) {
      return '#f8f9fa';
    }
  };

  return (
    <div key={row.id}>
      {rowCustomComponent ? (
        <div
          style={{
            height: isCompactView ? `${rowHeight / 2}px` : `${rowHeight}px`,
            borderBottom: '1px solid gray',
            display: 'flex',
            backgroundColor: getRowBackgroundColor(),
            position: 'relative',
          }}>
          {rowCustomComponent ? (
            (() => {
              const CustomComponent = rowCustomComponent;
              return <CustomComponent row={row} isCompactView={isCompactView} />;
            })()
          ) : (
            <div>Undefined Component</div>
          )}
        </div>
      ) : (
        <div
          className='gantt-data-panel-row-container'
          style={{
            gridTemplateColumns,
            position: 'relative',
          }}>
          {visibleFields.map(([key], index) => (
            <div
              key={`${row.id}-${key}-${index}`}
              onClick={handleRowSelect}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className='gantt-data-panel-row-cell'
              style={{
                paddingLeft: '10px',
                fontWeight: row.highlight ? 'bold' : 'normal',
                background: `rgba(0, 0, 0, ${0.1 + depth * 0.1})`,
              }}>
              <p className='gantt-data-panel-row-cell-content'>{renderRowContent(row, key)}</p>

              {key === 'name' && ButtonContainer && hoveredRowId === String(row.id) && (
                <div className='gantt-data-panel-row-cell-action-buttons'>
                  <ButtonContainer />
                </div>
              )}
            </div>
          ))}

          {/* Collapse/Expand arrow at far right edge of the row */}
          {hasChildren && (
            <div
              onClick={handleToggleCollapse}
              style={{
                position: 'absolute',
                right: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'black',
                cursor: 'pointer',
                padding: '4px',
                zIndex: 1,
              }}>
              {isCollapsed ? <ChevronRightIcon /> : <ChevronDownIcon />}
            </div>
          )}
        </div>
      )}

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
