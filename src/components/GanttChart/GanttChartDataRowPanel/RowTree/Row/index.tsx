import { memo, useState } from 'react';
import { useGanttChartStore } from '../../../../../stores/useGanttChartStore';
import { Row } from '../../../../../types/row';
import { progressFormatter } from '../../../../../utils/progressFormater';
import { ChevronDownIcon, ChevronRightIcon } from '../../../../../assets/icons/icons';

const progressDisplay = (row: Row) => {
  if (row.currentProgress === undefined || row.maxProgress === undefined) return '';
  return progressFormatter(row.currentProgress, row.maxProgress);
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
  const row = useGanttChartStore(state => state.getRowById(rowId));
  const collapsedItems = useGanttChartStore(state => state.collapsedItems);
  const selectRow = useGanttChartStore(state => state.externalGetSelectedRow);
  const toggleCollapse = useGanttChartStore(state => state.toggleCollapse);
  const ButtonContainer = useGanttChartStore(state => state.ButtonContainer);
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);

  if (!row) return;

  const hasChildren = Array.isArray(row.children) && (row.children as Row[]).length > 0;
  const isCollapsed = collapsedItems.has(row.id.toString());

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
            onClick={() => selectRow && selectRow(row)}
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
