# React Gantt Chart Advanced MSP

A powerful, feature-rich Gantt Chart library built with React and TypeScript. This library provides an intuitive interface for project management, timeline visualization, and task scheduling with advanced features like drag-and-drop, zooming, collapsible rows, and custom components.

## 🚀 Features

- **Interactive Timeline**: Drag and drop tasks, resize bars, and scroll through timeline
- **Multiple Time Views**: Daily, Weekly, Monthly, Quarterly, and Yearly views
- **Hierarchical Data**: Support for nested tasks with collapsible/expandable rows
- **Custom Components**: Fully customizable row components and styling
- **Progress Tracking**: Built-in progress indicators and custom progress labels
- **Zoom Functionality**: Zoom in/out for better timeline visibility
- **Responsive Design**: Adapts to different screen sizes and orientations
- **TypeScript Support**: Full TypeScript support with type definitions
- **Performance Optimized**: Efficient rendering with virtualization and memoization

## 📦 Installation

```bash
npm install react-gantt-chart-adv-msp
```

```bash
yarn add react-gantt-chart-adv-msp
```

```bash
pnpm add react-gantt-chart-adv-msp
```

## 🎯 Quick Start

```tsx
import React from 'react';
import { GanttChart, Column, Row, timeFrameSetting } from 'react-gantt-chart-adv-msp';
import 'react-gantt-chart-adv-msp/style.css';

const columns: Column = {
  id: { name: 'ID', show: false },
  name: { name: 'Task Name', show: true },
  start: { name: 'Start Date', show: false },
  end: { name: 'End Date', show: false },
};

const rows: Row[] = [
  {
    id: 1,
    name: 'Project Planning',
    start: '2024-01-01',
    end: '2024-01-15',
    currentProgress: 80,
    maxProgress: 100,
    children: [
      {
        id: 2,
        name: 'Requirements Gathering',
        start: '2024-01-01',
        end: '2024-01-10',
        currentProgress: 100,
        maxProgress: 100,
      },
      {
        id: 3,
        name: 'Design Phase',
        start: '2024-01-08',
        end: '2024-01-15',
        currentProgress: 60,
        maxProgress: 100,
      },
    ],
  },
];

function App() {
  const handleRowSelection = (row: Row) => {
    console.log('Selected row:', row);
  };

  return (
    <div style={{ height: '600px', width: '100%' }}>
      <GanttChart
        columns={columns}
        rows={rows}
        defaultView={timeFrameSetting.daily}
        showSidebar={true}
        getSelectedRow={handleRowSelection}
      />
    </div>
  );
}

export default App;
```

## 📚 API Reference

### GanttChart Props

| Prop              | Type                   | Default                    | Description                        |
| ----------------- | ---------------------- | -------------------------- | ---------------------------------- |
| `rows`            | `Row[]`                | Required                   | Array of task data                 |
| `columns`         | `Column`               | Required                   | Column configuration               |
| `showSidebar`     | `boolean`              | `true`                     | Show/hide the data panel sidebar   |
| `defaultView`     | `TimeFrameSettingType` | `timeFrameSetting.monthly` | Initial time view                  |
| `ButtonContainer` | `React.FC`             | `undefined`                | Custom button component for rows   |
| `getSelectedRow`  | `(row: Row) => void`   | `undefined`                | Callback when a row is selected    |
| `className`       | `string`               | `''`                       | Custom CSS class                   |
| `height`          | `string \| number`     | `undefined`                | Chart height                       |
| `width`           | `string \| number`     | `undefined`                | Chart width                        |
| `customRow`       | `customRowType`        | `undefined`                | Custom row component configuration |
| `isCompactView`   | `boolean`              | `false`                    | Enable compact view mode           |

### Row Interface

```tsx
interface Row {
  id: string | number; // Unique identifier
  name: string; // Display name
  start: string; // Start date (ISO string)
  end: string; // End date (ISO string)
  highlight?: boolean; // Highlight the row
  children?: Row[]; // Nested rows
  currentProgress?: number; // Current progress value
  maxProgress?: number; // Maximum progress value
  isLocked?: boolean; // Prevent drag/resize
  showProgressIndicator?: {
    // Progress display options
    showLabelOnSideBar?: boolean;
    showLabelOnGanttBar?: boolean;
    showProgressBar?: boolean;
  };
  progressIndicatorLabel?: string; // Custom progress label
  [key: string]: unknown; // Additional custom properties
}
```

### Column Interface

```tsx
interface Column {
  id: { name: string; show: boolean };
  name: { name: string; show: boolean };
  start: { name: string; show: boolean };
  end: { name: string; show: boolean };
  [key: string]: { name: string; show: boolean }; // Additional columns
}
```

### Time Frame Settings

```tsx
import { timeFrameSetting } from 'react-gantt-chart-adv-msp';

// Available time frames:
timeFrameSetting.daily; // Detailed daily view
timeFrameSetting.weekly; // Weekly view
timeFrameSetting.monthly; // Monthly view
timeFrameSetting.yearly; // Yearly overview
timeFrameSetting.quarterMonth; // Quarterly with months
timeFrameSetting.quarterYear; // Quarterly with years
```

## 🎨 Custom Row Components

Create custom row components for enhanced functionality:

```tsx
import React from 'react';
import { Row } from 'react-gantt-chart-adv-msp';

interface CustomRowProps {
  row: Row;
  isCompactView: boolean;
}

const CustomRowComponent: React.FC<CustomRowProps> = ({ row, isCompactView }) => {
  const progressPercentage = row.maxProgress ? Math.round(((row.currentProgress || 0) / row.maxProgress) * 100) : 0;

  return (
    <div
      style={{
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
      <div>
        <div style={{ fontWeight: 'bold' }}>{row.name}</div>
        {!isCompactView && (
          <div style={{ fontSize: '12px', color: '#666' }}>
            Progress: {row.currentProgress}/{row.maxProgress}
          </div>
        )}
      </div>
      <span
        style={{
          backgroundColor: progressPercentage === 100 ? '#10b981' : '#f59e0b',
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
        }}>
        {progressPercentage}%
      </span>
    </div>
  );
};

// Use in GanttChart
<GanttChart
  // ... other props
  customRow={{
    rowHeight: 60,
    component: CustomRowComponent,
    collapsedBackgroundColor: '#f0f0f0',
    collapsedIconColor: '#333',
  }}
/>;
```

## 🛠 Utility Functions

### Zoom Functions

```tsx
import { zoomIn, zoomOut } from 'react-gantt-chart-adv-msp';

// Zoom in/out programmatically
const handleZoomIn = () => zoomIn();
const handleZoomOut = () => zoomOut();
```

### Scroll Functions

```tsx
import { scrollToGanttBar, scrollToDate, scrollToToday } from 'react-gantt-chart-adv-msp';

// Scroll to specific row
await scrollToGanttBar(row, { offset: 100, behavior: 'smooth' });

// Scroll to specific date
await scrollToDate(new Date('2024-06-01'), { offset: 50 });

// Scroll to today
await scrollToToday({ behavior: 'smooth' });
```

### Row Collapse Utilities

```tsx
import { rowCollapseUtils } from 'react-gantt-chart-adv-msp';

// Collapse/expand specific row
rowCollapseUtils.toggleRow(rowId);

// Check if row is collapsed
const isCollapsed = rowCollapseUtils.isRowCollapsed(rowId);

// Collapse all rows
rowCollapseUtils.collapseAllRows();

// Expand all rows
rowCollapseUtils.expandAllRows();
```

## 🎯 Advanced Examples

### Project Management Dashboard

```tsx
import React, { useState } from 'react';
import { GanttChart, timeFrameSetting, zoomIn, zoomOut, scrollToToday } from 'react-gantt-chart-adv-msp';

const ProjectGantt = () => {
  const [currentView, setCurrentView] = useState(timeFrameSetting.daily);
  const [showSidebar, setShowSidebar] = useState(true);

  const projectData = [
    {
      id: 'phase1',
      name: 'Phase 1: Planning',
      start: '2024-01-01',
      end: '2024-02-29',
      currentProgress: 1500,
      maxProgress: 2000,
      highlight: true,
      showProgressIndicator: {
        showLabelOnSideBar: true,
        showLabelOnGanttBar: true,
        showProgressBar: true,
      },
      progressIndicatorLabel: ' (75% Complete)',
      children: [
        {
          id: 'task1',
          name: 'Requirements Analysis',
          start: '2024-01-01',
          end: '2024-01-15',
          currentProgress: 100,
          maxProgress: 100,
          isLocked: false,
        },
      ],
    },
  ];

  const columns = {
    id: { name: 'ID', show: false },
    name: { name: 'Task', show: true },
    start: { name: 'Start', show: false },
    end: { name: 'End', show: false },
  };

  return (
    <div style={{ height: '100vh' }}>
      {/* Control Panel */}
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <button onClick={() => setCurrentView(timeFrameSetting.daily)}>Daily</button>
        <button onClick={() => setCurrentView(timeFrameSetting.weekly)}>Weekly</button>
        <button onClick={() => setCurrentView(timeFrameSetting.monthly)}>Monthly</button>
        <button onClick={() => setShowSidebar(!showSidebar)}>Toggle Sidebar</button>
        <button onClick={zoomIn}>Zoom In</button>
        <button onClick={zoomOut}>Zoom Out</button>
        <button onClick={() => scrollToToday()}>Today</button>
      </div>

      {/* Gantt Chart */}
      <GanttChart
        columns={columns}
        rows={projectData}
        defaultView={currentView}
        showSidebar={showSidebar}
        height='calc(100vh - 60px)'
        getSelectedRow={row => console.log('Selected:', row.name)}
      />
    </div>
  );
};
```

### Resource Management

```tsx
const ResourceGantt = () => {
  const resourceData = [
    {
      id: 'dev-team',
      name: 'Development Team',
      start: '2024-01-01',
      end: '2024-12-31',
      children: [
        {
          id: 'john-doe',
          name: 'John Doe - Frontend',
          start: '2024-01-01',
          end: '2024-06-30',
          currentProgress: 160,
          maxProgress: 180,
          progressIndicatorLabel: ' hrs worked',
        },
        {
          id: 'jane-smith',
          name: 'Jane Smith - Backend',
          start: '2024-01-15',
          end: '2024-08-15',
          currentProgress: 140,
          maxProgress: 160,
          progressIndicatorLabel: ' hrs worked',
        },
      ],
    },
  ];

  return (
    <GanttChart
      columns={{
        id: { name: 'ID', show: false },
        name: { name: 'Resource', show: true },
        start: { name: 'Start', show: true },
        end: { name: 'End', show: true },
      }}
      rows={resourceData}
      defaultView={timeFrameSetting.monthly}
      isCompactView={false}
    />
  );
};
```

## 🎨 Styling & Theming

The library includes CSS custom properties for easy theming:

```css
:root {
  /* Colors */
  --gantt-bar-default-background: #4169e1;
  --gantt-bar-highlight-background: #32de84;
  --gantt-bar-text-color: white;

  /* Sizes */
  --gantt-sidebar-width-fr: 0.3fr;
  --gantt-bar-resize-handle-width: 8px;

  /* Fonts */
  --gantt-bar-text-font-size: 0.9em;
  --gantt-primary-header-font-weight: 500;
}
```

## 🔧 TypeScript Support

The library is built with TypeScript and provides full type definitions:

```tsx
import type { GanttChartProps, Row, Column, TimeFrameSettingType } from 'react-gantt-chart-adv-msp';
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 📄 License

MIT License

---

Made with ❤️ by [Kimleng Soth](mailto:your-email@example.com)
