// components/TimerDisplay.tsx
import React from "react";
import { Clock } from "lucide-react";
import { TimerDisplayProps } from "../type/types.tsx";

const TimerDisplay: React.FC<TimerDisplayProps> = ({
  timerEnabled,
  timerActive,
  timeRemaining,
}) => {
  if (!timerEnabled || !timerActive) return null;

  return (
    <div className="flex items-center text-blue-600">
      <Clock className="w-5 h-5 mr-1" />
      {timeRemaining} sec
    </div>
  );
};

export default TimerDisplay;