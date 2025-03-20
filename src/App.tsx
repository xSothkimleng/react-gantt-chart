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
  start: { name: 'Recurring', show: true },
  end: { name: 'Monthly Subscription', show: false },
};

const processJsonData = (data: any[]): Row[] => {
  const rows: Row[] = [];

  data.forEach(quarter => {
    const quarterCell: Row = {
      id: quarter.id,
      name: `Quarter ${quarter.number}`,
      currentProgress: quarter.actual,
      maxProgress: quarter.target,
      showProgressIndicator: {
        showLabel: true,
        showProgressBar: true,
      },
      progressIndicatorLabelFormatter: () => ` : anything here : ${quarter.actual}$ / ${quarter.target}$`,
      start: new Date(quarter.start).toISOString(),
      end: new Date(quarter.end).toISOString(),
      isLocked: false,
      children: [],
    };

    quarter.months.forEach((month: any) => {
      const monthCell: Row = {
        id: month.id,
        name: month.name,
        currentProgress: month.actual,
        maxProgress: month.target,
        showProgressIndicator: {
          showLabel: true,
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

function App() {
  const [currentView, setCurrentView] = useState<TimeFrameSettingType>(timeFrameSetting.monthly);
  const [showSidebar, setShowSidebar] = useState<boolean>(true);

  const getSelectedRow = (row: Row) => {
    console.log('Selected item', row);
  };

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
      <div style={{ display: 'flex', gap: 2 }}>
        <select
          style={{ background: 'rgba(0,0,0,0.08)', border: 'none' }}
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
        <div style={{ display: 'flex', gap: '1px' }}>
          <button onClick={zoomOut} style={{ cursor: 'pointer', padding: '5px' }}>
            <SubtractIcon /> Zoom Out
          </button>
          <button onClick={zoomIn} style={{ cursor: 'pointer', padding: '5px' }}>
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
        className=''
      />
    </div>
  );
}

export default App;
