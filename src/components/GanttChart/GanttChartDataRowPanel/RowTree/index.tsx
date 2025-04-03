'use client';
import { useGanttChartStore } from '../../../../stores/useGanttChartStore';
import '../styles.css';
import DataRow from './Row';

type DataRowTree = {
  visibleFields: [string, { name: string; show: boolean }][];
  gridTemplateColumns: string;
};

const DataRowTree: React.FC<DataRowTree> = ({ visibleFields, gridTemplateColumns }) => {
  const rows = useGanttChartStore(state => state.rows);

  return (
    <div>
      {rows.length === 0 ? (
        <div
          style={{
            gridColumn: `span ${visibleFields.length}`,
            textAlign: 'center',
            borderTop: '1px solid lightgray',
          }}>
          No Data
        </div>
      ) : (
        rows.map(row => <DataRow rowId={row.id} gridTemplateColumns={gridTemplateColumns} visibleFields={visibleFields} />)
      )}
    </div>
  );
};

export default DataRowTree;
