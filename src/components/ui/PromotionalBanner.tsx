'use client';

import { useState, useEffect } from 'react';

export function PromotionalBanner() {
  const [timeLeft, setTimeLeft] = useState({
    hours: 48,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const getEndDate = () => {
      const storedEndDate = localStorage.getItem('promotionEndDate');
      if (storedEndDate) {
        const endDate = new Date(storedEndDate);
        // Verify the stored date is in the future
        if (endDate > new Date()) {
          return endDate;
        }
      }
      // Set new end date if not stored or if stored date is in the past
      const endDate = new Date();
      endDate.setHours(endDate.getHours() + 48);
      endDate.setMinutes(endDate.getMinutes());
      endDate.setSeconds(endDate.getSeconds());
      localStorage.setItem('promotionEndDate', endDate.toISOString());
      return endDate;
    };

    const endDate = getEndDate();

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = Math.max(0, endDate.getTime() - now.getTime());

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return {
        hours,
        minutes,
        seconds
      };
    };

    // Initial calculation
    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);

    // Update every second
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      // Clear interval when timer reaches zero
      if (newTimeLeft.hours === 0 && newTimeLeft.minutes === 0 && newTimeLeft.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="text-center sm:text-left mb-2 sm:mb-0">
          <span className="font-bold">🚀 LAUNCH SPECIAL OFFER!</span>
          <span className="ml-2">Create your memecoin with ALL features for just 0.2 SOL!</span>
        </div>
        <div className="flex items-center space-x-2 font-mono">
          <span>Ends in:</span>
          <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
          <span>:</span>
          <span className="bg-white/20 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    </div>
  );
}
