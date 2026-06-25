'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { Feedback } from '@/types/feedback';
import FeedbackHub from '@/components/FeedbackHub';

export default function CashierFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const cashierName = 'Cashier-1'; // In production, from auth

  useEffect(() => {
    loadFeedback();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(loadFeedback, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadFeedback = () => {
    const stored = localStorage.getItem('cafe-feedback');
    if (!stored) {
      setFeedback([]);
      return;
    }

    const allFeedback: Feedback[] = JSON.parse(stored);
    
    // Filter feedback for orders this cashier was involved in
    const cashierFeedback = allFeedback.filter(
      (f) => f.cashierName === cashierName && !f.archived
    );

    // Sort: pinned first, then by timestamp (newest first)
    const sorted = cashierFeedback.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setFeedback(sorted);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <MessageCircle className="text-blue-400" size={32} />
                <h1 className="text-3xl font-bold text-white">Customer Feedback</h1>
              </div>
              <p className="text-gray-400">ከነአን Café - Cashier Dashboard</p>
            </div>
            <Link
              href="/dashboard/cashier"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Card */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5 mb-6">
          <h3 className="text-lg font-semibold text-blue-400 mb-2">
            Your Feedback
          </h3>
          <p className="text-gray-300 text-sm">
            View feedback from customers whose payments you've processed. This is read-only - only admins can manage feedback.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Total Feedback</p>
            <p className="text-3xl font-bold text-white">{feedback.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Average Rating</p>
            <p className="text-3xl font-bold text-yellow-400">
              {feedback.length > 0
                ? (
                    feedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
                    feedback.filter((f) => f.rating).length
                  ).toFixed(1)
                : '0.0'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
            <p className="text-gray-400 text-sm mb-1">Positive Reviews</p>
            <p className="text-3xl font-bold text-green-400">
              {feedback.filter((f) => (f.rating || 0) >= 4).length}
            </p>
          </div>
        </div>

        {/* Feedback List */}
        <FeedbackHub feedback={feedback} isAdmin={false} theme="dark" />
      </div>
    </main>
  );
}
