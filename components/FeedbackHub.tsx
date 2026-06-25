'use client';

import { MessageCircle, Star, User, Calendar } from 'lucide-react';
import { Feedback } from '@/types/feedback';

interface FeedbackHubProps {
  feedback: Feedback[];
  isAdmin?: boolean;
  onPin?: (id: string) => void;
  onArchive?: (id: string) => void;
  theme?: 'light' | 'dark';
}

export default function FeedbackHub({
  feedback,
  isAdmin = false,
  onPin,
  onArchive,
  theme = 'light',
}: FeedbackHubProps) {
  const isDark = theme === 'dark';

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}
          />
        ))}
      </div>
    );
  };

  const getSentimentEmoji = (rating?: number) => {
    if (!rating) return '💬';
    if (rating >= 4) return '😊';
    if (rating >= 3) return '😐';
    return '😞';
  };

  if (feedback.length === 0) {
    return (
      <div className={`text-center py-16 rounded-xl border ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <MessageCircle
          className={`mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}
          size={64}
        />
        <h2 className={`text-xl font-semibold mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          No Feedback Yet
        </h2>
        <p className={isDark ? 'text-gray-500' : 'text-gray-500'}>
          Customer feedback will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feedback.map((item) => (
        <div
          key={item.id}
          className={`rounded-xl border overflow-hidden transition-all ${
            item.pinned
              ? isDark
                ? 'bg-yellow-500/10 border-yellow-500/30 shadow-lg'
                : 'bg-yellow-50 border-yellow-300 shadow-lg'
              : isDark
              ? 'bg-gray-800 border-gray-700 hover:border-blue-500'
              : 'bg-white border-gray-200 hover:border-blue-400'
          }`}
        >
          {/* Pinned Badge */}
          {item.pinned && (
            <div className={`px-4 py-2 text-xs font-semibold ${
              isDark ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
            }`}>
              ⭐ Pinned Feedback
            </div>
          )}

          <div className="p-5">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{getSentimentEmoji(item.rating)}</span>
                  {renderStars(item.rating)}
                </div>
                <div className={`flex items-center gap-4 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {item.customerName}
                  </span>
                  <span>Table {item.tableNumber}</span>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className={`mb-4 p-4 rounded-lg ${
              isDark ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
              <p className={`text-center italic ${
                isDark ? 'text-gray-200' : 'text-gray-800'
              }`}>
                "{item.comment}"
              </p>
            </div>

            {/* Staff Info */}
            {(item.waiterName || item.cashierName) && (
              <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                {item.waiterName && <span>Served by: {item.waiterName}</span>}
                {item.waiterName && item.cashierName && <span className="mx-2">•</span>}
                {item.cashierName && <span>Cashier: {item.cashierName}</span>}
              </div>
            )}

            {/* Admin Actions */}
            {isAdmin && onPin && onArchive && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => onPin(item.id)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    item.pinned
                      ? isDark
                        ? 'bg-gray-700 text-gray-400'
                        : 'bg-gray-200 text-gray-600'
                      : isDark
                      ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                      : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                  }`}
                >
                  {item.pinned ? 'Unpin' : 'Pin to Top'}
                </button>
                <button
                  onClick={() => onArchive(item.id)}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
