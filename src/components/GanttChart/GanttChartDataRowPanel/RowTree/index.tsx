'use client';
import { useRowsStore } from '../../../../stores/useRowsStore';
import { useShallow } from 'zustand/shallow';
import '../styles.css';
import DataRow from './Row';

type DataRowTree = {
  visibleFields: [string, { name: string; show: boolean }][];
  gridTemplateColumns: string;
};

const DataRowTree: React.FC<DataRowTree> = ({ visibleFields, gridTemplateColumns }) => {
  const rows = useRowsStore(useShallow(state => state.rows));

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
        rows.map(row => (
          <DataRow key={row.id} rowId={row.id} gridTemplateColumns={gridTemplateColumns} visibleFields={visibleFields} />
        ))
      )}
    </div>
  );
};

export default DataRowTree;
