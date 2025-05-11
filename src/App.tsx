/* eslint-disable @typescript-eslint/no-explicit-any */
import './App.css';
import GanttChart from './components/GanttChart';
import { useState } from 'react';
import { timeFrameSetting } from './constants/timeFrameSetting';
import { TimeFrameSettingType } from './types/timeFrameSettingType';
import { PlusIcon, SubtractIcon } from './assets/icons/icons';
import { Column } from './types/column';
import { Row } from './types/row';
import jsonData from './data/qrf_sample.json';
import { zoomIn, zoomOut } from './utils/zoomFunctions';

const columns: Column = {
  id: { name: 'ID', show: false },
  name: { name: 'Income', show: true },
  start: { name: 'Recurring', show: false },
  end: { name: 'Monthly Subscription', show: false },
};

function format() {
  return ' : Custom Label';
}

const processJsonData = (data: any[]): Row[] => {
  const rows: Row[] = [];

  data.forEach(quarter => {
    const quarterCell: Row = {
      id: quarter.id,
      name: `Quarter ${quarter.number}`,
      currentProgress: quarter.actual,
      maxProgress: quarter.target,
      start: new Date(quarter.start).toISOString(),
      end: new Date(quarter.end).toISOString(),
      isLocked: true,
      progressIndicatorLabel: `${format()}`,
      showProgressIndicator: {
        showLabelOnGanttBar: true,
        showLabelOnSideBar: true,
        showProgressBar: true,
      },
      children: [],
    };

    quarter.months.forEach((month: any) => {
      const monthCell: Row = {
        id: month.id,
        name: month.name,
        currentProgress: month.actual,
        maxProgress: month.target,
        progressIndicatorLabel: ` : ${month.actual} / ${month.target}`,
        showProgressIndicator: {
          showLabelOnGanttBar: true,
          showLabelOnSideBar: true,
          showProgressBar: true,
        },
        start: new Date(month.start).toISOString(),
        end: new Date(month.end).toISOString(),
        isLocked: false,
        children: [],
      };

      month.weeks.forEach((week: any) => {
        const weekCell: Row = {
          id: week.id,
          name: `Week ${week.number}`,
          currentProgress: week.actual,
          maxProgress: week.target,
          showProgressIndicator: {
            showLabelOnGanttBar: true,
            showLabelOnSideBar: true,
            showProgressBar: false,
          },
          start: new Date(week.start).toISOString(),
          end: new Date(week.end).toISOString(),
          isLocked: false,
        };
        monthCell.children?.push(weekCell);
      });
      quarterCell.children?.push(monthCell);
    });
    rows.push(quarterCell);
  });

  return rows;
};

const rows = processJsonData(jsonData);

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

function App() {
  const [currentView, setCurrentView] = useState<TimeFrameSettingType>(timeFrameSetting.daily);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  // const [currentRow, setCurrentRow] = useState<Row[]>(rows);
  // const counterRef = useRef<number>(0);

  // const myPromise = new Promise(resolve => {
  //   setTimeout(() => {
  //     counterRef.current = counterRef.current + 1;
  //     console.log('Counter:', counterRef.current);
  //     resolve(2000);
  //   }, 2000);
  // });

  // myPromise.then(() => {
  //   if (counterRef.current % 2 == 0) {
  //     setCurrentRow(rows);
  //   } else {
  //     setCurrentRow([]);
  //   }
  // });

  const getSelectedRow = (row: Row) => {
    console.log('Selected item', row);
  };

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <div style={{ display: 'flex', gap: 2 }}>
        <select
          style={{ background: 'rgba(0,0,0,0.08)', border: 'none' }}
          value={currentView.name}
          onChange={e => {
            const viewName = e.target.value as keyof typeof timeFrameSetting;
            setCurrentView(timeFrameSetting[viewName]);
          }}>
          <option value='daily'>Daily</option>
          <option value='weekly'>Weekly</option>
          <option value='monthly'>Monthly</option>
          <option value='yearly'>Yearly</option>
        </select>
        <button onClick={() => setShowSidebar(!showSidebar)}>Show Sidebar</button>
        <div style={{ display: 'flex', gap: '1px' }}>
          <button onClick={() => zoomOut()} style={{ cursor: 'pointer', padding: '5px' }}>
            <SubtractIcon /> Zoom Out
          </button>
          <button onClick={() => zoomIn()} style={{ cursor: 'pointer', padding: '5px' }}>
            <PlusIcon /> Zoom In
          </button>
        </div>
      </div>

      <GanttChart
        columns={columns}
        rows={rows}
        defaultView={currentView}
        showSidebar={showSidebar}
        getSelectedRow={getSelectedRow}
        ButtonContainer={ButtonContainer}
        className='user-gantt-style'
        height='100vh'
        width='100%'
      />
    </div>
  );
}

export default App;
