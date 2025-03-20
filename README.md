# Code Example

```tsx
import './App.css';
import GanttChart from './components/GanttChart';
import { useState } from 'react';
import { timeFrameSetting } from './constants/timeFrameSetting';
import { TimeFrameSettingType } from './types/timeFrameSettingType';
import { PlusIcon, SubtractIcon } from './assets/icons/icons';
import { Column } from './types/column';
import { Row } from './types/row';

const column: Column = {
  id: { name: 'ID', show: true },
  name: { name: 'Income', show: true },
  start: { name: 'Recurring', show: true },
  end: { name: 'Monthly Subscription', show: false },
};

const row: Row[] = [
  {
    id: 1,
    name: 'Q1',
    start: '2025-01-01',
    end: '2025-03-31',
    currentProgress: 8000,
    maxProgress: 10000,
    progressFormatter: 'comma',
    showProgressPercentage: true,
    highlight: true,
    children: [
      { id: 2, name: 'Week 1', start: '2025-01-01', end: '2025-01-05' },
      { id: 3, name: 'Week 2', start: '2025-01-06', end: '2025-01-12' },
      { id: 4, name: 'Week 3', start: '2025-01-13', end: '2025-01-19' },
      {
        id: 5,
        name: 'Week 4',
        start: '2025-01-20',
        end: '2025-01-26',
        highlight: true,
        children: [
          {
            id: 6,
            name: 'Week 1',
            start: '2025-01-01',
            end: '2025-01-05',
            children: [
              { id: 7, name: 'Week 1', start: '2025-01-01', end: '2025-01-05' },
              { id: 8, name: 'Week 2', start: '2025-01-06', end: '2025-01-12' },
              { id: 9, name: 'Week 3', start: '2025-01-13', end: '2025-01-19' },
              { id: 10, name: 'Week 4', start: '2025-01-20', end: '2025-01-26' },
            ],
          },
          { id: 11, name: 'Week 2', start: '2025-01-06', end: '2025-01-12' },
          { id: 12, name: 'Week 3', start: '2025-01-13', end: '2025-01-19' },
          { id: 13, name: 'Week 4', start: '2025-01-20', end: '2025-01-26' },
        ],
      },
      { id: 14, name: 'Week 5', start: '2025-01-27', end: '2025-02-02' },
      { id: 15, name: 'Week 6', start: '2025-02-03', end: '2025-02-09' },
      { id: 16, name: 'Week 7', start: '2025-02-10', end: '2025-02-16' },
      { id: 17, name: 'Week 8', start: '2025-02-17', end: '2025-02-23' },
      { id: 18, name: 'Week 9', start: '2025-02-24', end: '2025-03-02' },
      { id: 19, name: 'Week 10', start: '2025-03-03', end: '2025-03-09' },
      { id: 20, name: 'Week 11', start: '2025-03-10', end: '2025-03-16' },
      { id: 21, name: 'Week 12', start: '2025-03-17', end: '2025-03-23' },
      { id: 22, name: 'Week 13', start: '2025-03-24', end: '2025-03-31' },
    ],
  },
];

const getSelectedRow = (row: Row) => {
  console.log('Selected item', row);
};

function App() {
  const [currentView, setCurrentView] = useState<TimeFrameSettingType>(timeFrameSetting.monthly);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const ButtonContainer = () => {
    return (
      <div style={{ display: 'flex', gap: '3px' }}>
        <button
          style={{
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(0,0,0,0.5)',
            transition: 'color 0.2s ease',
          }}>
          <PlusIcon />
        </button>
        <button
          style={{
            cursor: 'pointer',
            padding: '4px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(0,0,0,0.5)',
            transition: 'color 0.2s ease',
          }}>
          <SubtractIcon />
        </button>
      </div>
    );
  };

  return (
    <div style={{ height: '100%' }}>
      <select
        value={currentView.name}
        onChange={e => {
          const viewName = e.target.value as keyof typeof timeFrameSetting;
          setCurrentView(timeFrameSetting[viewName]);
        }}>
        <option value='monthly'>Monthly</option>
        <option value='yearly'>Yearly</option>
        <option value='quarterMonth'>Quarter Month</option>
        <option value='quarterYear'>Quarter Year</option>
      </select>
      <button onClick={() => setShowSidebar(!showSidebar)}>Show Sidebar</button>
      <GanttChart
        column={column}
        row={row}
        defaultView={currentView}
        showSidebar={showSidebar}
        getSelectedRow={getSelectedRow}
        ButtonContainer={ButtonContainer}
      />
    </div>
  );
}

export default App;
```

## Type

## Column : Header Field

```ts
interface DefaultColumnSetting {
  id: {
    name: string;
    show: boolean;
  };
  name: {
    name: string;
    show: true;
  };
  start: {
    name: string;
    show: boolean;
  };
  end: {
    name: string;
    show: boolean;
  };
}

export interface Column extends DefaultColumnSetting {
  [key: string]: {
    name: string;
    show: boolean;
  };
}
```

## Row

```ts
interface DefaultRowSetting {
  id: string | number;
  name: string;
  start: string;
  end: string;
}

export interface Row extends DefaultRowSetting {
  highlight?: boolean;
  children?: Row[];
  currentProgress?: number;
  maxProgress?: number;
  isLocked?: boolean;
  showProgressPercentage?: boolean;
  progressNumberFormat?: 'currency' | 'comma';
  [key: string]: unknown;
}
```
