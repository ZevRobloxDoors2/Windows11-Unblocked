import React, { useState, useEffect } from 'react';
import { BatteryCharging } from 'lucide-react';

export function FakeDeadComputer({ batteryInfo }: { batteryInfo: any }) {
  const [fakePercent, setFakePercent] = useState(1);
  const [isCharging, setIsCharging] = useState(batteryInfo?.charging || false);

  useEffect(() => {
    // Attempt fullscreen
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
    } catch (e) {}

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent defaults to make it seem dead
      e.preventDefault();
      
      // Fallback: If Battery API isn't supported or they don't have a real charger,
      // pressing 'c' secretly triggers the "plugged in" state.
      if (e.key === 'c' || e.key === 'C') {
        setIsCharging(true);
      }
    };
    
    // Add event listener with capture to intercept keys early
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    
    // Also disable context menu
    const handleContextMenu = (e: Event) => e.preventDefault();
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Update charging state if real battery info changes
  useEffect(() => {
    if (batteryInfo?.charging) {
      setIsCharging(true);
    }
  }, [batteryInfo?.charging]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging) {
      interval = setInterval(() => {
        setFakePercent(p => {
          if (p >= 5) {
            clearInterval(interval);
            // Reached 5%, exit fullscreen and redirect
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(()=>{});
            }
            window.location.href = 'https://classroom.google.com';
            return 5;
          }
          return p + 1;
        });
      }, 3000); // Increment every 3 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isCharging]);

  return (
    <div className="fixed inset-0 z-[99999] bg-black text-white flex flex-col items-center justify-center cursor-none select-none">
      {isCharging && (
        <div className="flex flex-col items-center justify-center animate-pulse">
          <BatteryCharging size={64} className="text-zinc-500 mb-4" />
          <h1 className="text-2xl font-light text-zinc-500">Wait until 5% to turn on ({fakePercent}%)</h1>
        </div>
      )}
    </div>
  );
}
