import React from 'react';
import { Row } from '../../types/row';
import { scrollToGanttBar } from '../../utils/scrollUtils';
import { rowCollapseUtils } from '../../utils/rowUtils';

interface CustomRowProps {
  row: Row;
  isCompactView: boolean;
}

const CustomRowComponent: React.FC<CustomRowProps> = ({ row, isCompactView }) => {
  const hasChildren = rowCollapseUtils.hasChildren(row.id);
  const isCollapsed = rowCollapseUtils.isRowCollapsed(row.id);
  // Handler for scrolling to the current row's Gantt bar
  const handleScrollToBar = async () => {
    const success = await scrollToGanttBar(row, {
      offset: 100,
      behavior: 'smooth',
    });

    if (!success) {
      console.warn('Failed to scroll to Gantt bar');
    }
  };

  const handleToggleCollapse = (e: React.MouseEvent) => {
    e.stopPropagation();
    rowCollapseUtils.toggleRow(row.id);
  };

  // Calculate progress percentage
  const progressPercentage =
    (row.maxProgress ?? 0) > 0 ? Math.round(((row.currentProgress ?? 0) / (row.maxProgress ?? 1)) * 100) : 0;

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        // backgroundColor: '#2a2d3a',
        padding: '0px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        transition: 'all 0.2s ease-in-out',
        cursor: 'default',
      }}>
      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Row name and progress badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: isCompactView ? '14px' : '15px',
            fontWeight: '500',
          }}>
          <span>{row.name}</span>
          <span
            style={{
              backgroundColor: progressPercentage === 100 ? '#10b981' : progressPercentage > 0 ? '#f59e0b' : '#6b7280',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600',
              minWidth: '35px',
              textAlign: 'center',
            }}>
            {progressPercentage}%
          </span>
        </div>

        {/* Progress details - only show in expanded view */}
        {!isCompactView && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#9ca3af',
            }}>
            <span>
              Progress: {row.currentProgress} of {row.maxProgress}
            </span>

            {/* Progress bar */}
          </div>
        )}
      </div>

      {/* Action button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button
          onClick={handleScrollToBar}
          style={{
            backgroundColor: '#0891b2',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease-in-out',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = '#0e7490';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = '#0891b2';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.1)';
          }}
          onMouseDown={e => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title='Scroll to this item in the timeline'>
          {/* Icon */}
          <svg
            width='12'
            height='12'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'>
            <path d='M9 18l6-6-6-6' />
          </svg>
          GO
        </button>
        {/* Collapse/Expand button - only show if has children */}
        {hasChildren && (
          <button
            onClick={handleToggleCollapse}
            style={{
              backgroundColor: '#0891b2',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            }}
            title={isCollapsed ? 'Expand children' : 'Collapse children'}>
            {/* Chevron icon */}
            <svg
              width='12'
              height='12'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              style={{
                transform: isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)',
                transition: 'transform 0.2s ease-in-out',
              }}>
              <path d='M9 18l6-6-6-6' />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomRowComponent;
