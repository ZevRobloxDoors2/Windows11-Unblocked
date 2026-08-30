import React, { useState, useEffect } from 'react';

export function GTAVModal() {
  const [timeLeft, setTimeLeft] = useState(10);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  if (dismissed) return null;

  return (
    <div className="absolute top-4 left-4 z-[200] bg-zinc-900 border-2 border-red-500 p-4 rounded-lg shadow-2xl max-w-sm pointer-events-auto">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-red-400 font-bold">GTA V Launch Instructions:</h3>
      </div>
      <ol className="text-sm text-white list-decimal list-inside space-y-2 mb-4">
        <li>Click Library on the bottom right corner.</li>
        <li>Click Cloud button in the search bar.</li>
        <li>Search up <strong>Grand</strong>.</li>
        <li>Click on <strong>GTA V</strong>.</li>
      </ol>
      <p className="text-xs text-red-400 font-bold mb-4 uppercase">
        IF BREAK THESE INSTRUCTIONS, GTAV will be deleted from this website...
      </p>
      <button 
        disabled={timeLeft > 0}
        onClick={() => setDismissed(true)}
        className={`w-full py-2 rounded-md font-bold transition-colors ${timeLeft > 0 ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-500'}`}
      >
        {timeLeft > 0 ? `Done (${timeLeft} secs)` : 'Done'}
      </button>
    </div>
  );
}
