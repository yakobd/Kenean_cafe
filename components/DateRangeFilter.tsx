'use client';

import { Calendar } from 'lucide-react';

export type DateRange = 'daily' | 'weekly' | 'monthly' | 'custom';

interface DateRangeFilterProps {
  selectedRange: DateRange;
  onRangeChange: (range: DateRange) => void;
  onCalendarClick: () => void;
  customDateLabel?: string;
  theme?: 'light' | 'dark';
}

export default function DateRangeFilter({
  selectedRange,
  onRangeChange,
  onCalendarClick,
  customDateLabel,
  theme = 'light'
}: DateRangeFilterProps) {
  const isDark = theme === 'dark';
  
  const buttonClass = (range: DateRange) => {
    const isActive = selectedRange === range;
    
    if (isDark) {
      return `px-6 py-3 rounded-lg font-semibold transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`;
    }
    
    return `px-6 py-3 rounded-lg font-semibold transition-colors ${
      isActive
        ? 'bg-gold text-white'
        : 'bg-white text-charcoal border border-gray-300 hover:bg-gray-50'
    }`;
  };

  const calendarButtonClass = isDark
    ? 'p-3 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors'
    : 'p-3 rounded-lg bg-white text-charcoal border border-gray-300 hover:bg-gray-50 transition-colors';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onCalendarClick}
        className={calendarButtonClass}
        title="Select custom date"
      >
        <Calendar size={20} />
      </button>
      
      <button
        onClick={() => onRangeChange('daily')}
        className={buttonClass('daily')}
      >
        Daily
      </button>
      
      <button
        onClick={() => onRangeChange('weekly')}
        className={buttonClass('weekly')}
      >
        Weekly
      </button>
      
      <button
        onClick={() => onRangeChange('monthly')}
        className={buttonClass('monthly')}
      >
        Monthly
      </button>

      {selectedRange === 'custom' && customDateLabel && (
        <span className={isDark ? 'text-gray-400 text-sm' : 'text-charcoal/60 text-sm'}>
          {customDateLabel}
        </span>
      )}
    </div>
  );
}
