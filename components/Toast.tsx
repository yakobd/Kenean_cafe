'use client';

import { CheckCircle2, X, XCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export default function Toast({
  message,
  isVisible,
  onClose,
  duration = 5000,
  type = 'success',
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />;
      case 'error':
        return <XCircle className="text-red-500 flex-shrink-0" size={24} />;
      case 'warning':
        return <AlertCircle className="text-orange-500 flex-shrink-0" size={24} />;
      case 'info':
        return <Info className="text-blue-500 flex-shrink-0" size={24} />;
      default:
        return <CheckCircle2 className="text-green-500 flex-shrink-0" size={24} />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-white border-2 border-green-200 text-charcoal shadow-xl';
      case 'error':
        return 'bg-white border-2 border-red-200 text-charcoal shadow-xl';
      case 'warning':
        return 'bg-white border-2 border-orange-200 text-charcoal shadow-xl';
      case 'info':
        return 'bg-white border-2 border-blue-200 text-charcoal shadow-xl';
      default:
        return 'bg-white border-2 border-green-200 text-charcoal shadow-xl';
    }
  };

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] animate-slide-down">
      <div className={`${getStyles()} px-6 py-4 rounded-2xl flex items-center gap-3 min-w-[320px] max-w-md`}>
        {getIcon()}
        <p className="flex-1 font-medium text-sm leading-relaxed">{message}</p>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
        >
          <X size={18} className="text-gray-500" />
        </button>
      </div>
    </div>
  );
}
