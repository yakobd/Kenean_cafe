'use client';

import { CheckCircle2 } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

export default function SuccessModal({
  isOpen,
  onClose,
  message,
}: SuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-scale-in">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <CheckCircle2 className="text-green-500 animate-bounce" size={64} />
          </div>
          <h2 className="text-2xl font-bold text-charcoal mb-2">Success!</h2>
          <p className="text-charcoal/60 mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full bg-gold text-white py-3 rounded-full font-semibold hover:bg-gold/90 transition-all duration-300"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
