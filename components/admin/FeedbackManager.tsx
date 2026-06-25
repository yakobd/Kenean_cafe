'use client';

import { useEffect, useState } from 'react';
import { MessageCircle, Archive, ArchiveRestore } from 'lucide-react';
import { Feedback } from '@/types/feedback';
import FeedbackHub from '@/components/FeedbackHub';

export default function FeedbackManager() {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [showArchived, setShowArchived] = useState(false);

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
    
    // Sort: pinned first, then by timestamp (newest first)
    const sorted = allFeedback.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setFeedback(sorted);
  };

  const handlePin = (id: string) => {
    const updated = feedback.map((f) =>
      f.id === id ? { ...f, pinned: !f.pinned } : f
    );
    setFeedback(updated);
    localStorage.setItem('cafe-feedback', JSON.stringify(updated));
  };

  const handleArchive = (id: string) => {
    const updated = feedback.map((f) =>
      f.id === id ? { ...f, archived: !f.archived } : f
    );
    setFeedback(updated);
    localStorage.setItem('cafe-feedback', JSON.stringify(updated));
  };

  const activeFeedback = feedback.filter((f) => !f.archived);
  const archivedFeedback = feedback.filter((f) => f.archived);
  const displayedFeedback = showArchived ? archivedFeedback : activeFeedback;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageCircle className="text-blue-400" size={32} />
          <div>
            <h2 className="text-2xl font-bold text-white">Feedback Manager</h2>
            <p className="text-gray-400 text-sm">Manage customer feedback and testimonials</p>
          </div>
        </div>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          {showArchived ? (
            <>
              <ArchiveRestore size={18} />
              Show Active
            </>
          ) : (
            <>
              <Archive size={18} />
              Show Archived
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Total Feedback</p>
          <p className="text-3xl font-bold text-white">{feedback.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Active</p>
          <p className="text-3xl font-bold text-blue-400">{activeFeedback.length}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Pinned</p>
          <p className="text-3xl font-bold text-yellow-400">
            {feedback.filter((f) => f.pinned).length}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm mb-1">Average Rating</p>
          <p className="text-3xl font-bold text-green-400">
            {feedback.length > 0
              ? (
                  feedback.reduce((sum, f) => sum + (f.rating || 0), 0) /
                  feedback.filter((f) => f.rating).length
                ).toFixed(1)
              : '0.0'}
          </p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">
          Admin Controls
        </h3>
        <p className="text-gray-300 text-sm">
          Pin great feedback to highlight it for staff. Archive feedback to keep the list clean without deleting it permanently.
        </p>
      </div>

      {/* Feedback List */}
      <FeedbackHub
        feedback={displayedFeedback}
        isAdmin={true}
        onPin={handlePin}
        onArchive={handleArchive}
        theme="dark"
      />
    </div>
  );
}
