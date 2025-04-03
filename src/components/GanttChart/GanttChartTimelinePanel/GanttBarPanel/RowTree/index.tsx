import GanttBar from '../GanttBar';
import { useGanttChartStore } from '../../../../../stores/useGanttChartStore';
import { Row } from '../../../../../types/row';
import { useShallow } from 'zustand/shallow';

const GanttBarPanelRowTree = () => {
  const rows = useGanttChartStore(useShallow(state => state.rows));
  const collapsedItems = useGanttChartStore(state => state.collapsedItems);

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
};

export default GanttBarPanelRowTree;
