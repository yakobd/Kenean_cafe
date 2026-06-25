'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface DatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDate: (date: string) => void;
  theme?: 'light' | 'dark';
}

export default function DatePickerModal({
  isOpen,
  onClose,
  onSelectDate,
  theme = 'light'
}: DatePickerModalProps) {
  const [selectedDate, setSelectedDate] = useState('');
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  const handleApply = () => {
    if (selectedDate) {
      onSelectDate(selectedDate);
      onClose();
    }
  };

  const bgClass = isDark ? 'bg-gray-800' : 'bg-white';
  const textClass = isDark ? 'text-white' : 'text-charcoal';
  const inputClass = isDark
    ? 'w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
    : 'w-full px-4 py-3 border border-gray-300 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-gold';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className={`${bgClass} rounded-2xl shadow-2xl max-w-md w-full`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className={`text-xl font-bold ${textClass}`}>Select Date</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-charcoal/60'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-charcoal/70'}`}>
            Choose a date to view orders
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            className={inputClass}
          />
          <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-charcoal/50'}`}>
            Select any date from the past to view orders from that day
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                : 'bg-gray-200 text-charcoal hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedDate}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedDate
                ? isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gold text-white hover:bg-gold/90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
