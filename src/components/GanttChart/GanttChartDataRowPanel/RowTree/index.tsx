'use client';
import { useShallow } from 'zustand/shallow';
import { useRowsStore } from '../../../../stores/useRowsStore';
// import { useShallow } from 'zustand/shallow';
import '../styles.css';
import DataRow from './Row';

type DataRowTree = {
  visibleFields: [string, { name: string; show: boolean }][];
  gridTemplateColumns: string;
};

const DataRowTree: React.FC<DataRowTree> = ({ visibleFields, gridTemplateColumns }) => {
  const rootIds = useRowsStore(useShallow(state => state.rootIds));

  return (
    <div>
      {rootIds.length === 0 ? (
        <div
          style={{
            gridColumn: `span ${visibleFields.length}`,
            textAlign: 'center',
            borderTop: '1px solid lightgray',
          }}>
          No Data
        </div>
      ) : (
        rootIds.map(rowId => (
          <DataRow key={rowId} rowId={rowId} gridTemplateColumns={gridTemplateColumns} visibleFields={visibleFields} />
        ))
      )}
    </div>
  );
};

export default DataRowTree;
