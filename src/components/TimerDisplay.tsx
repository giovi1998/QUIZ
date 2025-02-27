// components/TimerDisplay.tsx
import React, { useEffect } from "react";

import { Clock } from "lucide-react";

type TimerDisplayProps = {
  timerEnabled: boolean;
  timerActive: boolean;
  timeRemaining: number;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  useEffect,

  timerEnabled,
  timerActive,
  timeRemaining,
}) => {
  useEffect(() => {
    if (timerEnabled && timerActive) {
      console.log("Timer started with duration:", timeRemaining);
    }
  }, [timerEnabled, timerActive, timeRemaining]);

  if (!timerEnabled || !timerActive) return null;  


  return (
    <div className="flex items-center text-blue-600">
      <Clock className="w-5 h-5 mr-1" />
      {timeRemaining} sec
    </div>
  );
};

export default TimerDisplay;
