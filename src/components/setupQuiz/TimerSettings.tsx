// components/setupQuiz/TimerSettings.tsx
import React from 'react';

type TimerSettingsProps = {
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
};

export const TimerSettings: React.FC<TimerSettingsProps> = ({
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
}) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">Abilita Timer</label>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
        <div className="flex items-center">
          <input
            id="timer-enabled"
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-500"
          />
          <label htmlFor="timer-enabled" className="ml-2 text-gray-700 cursor-pointer">
            {timerEnabled ? "Attivo" : "Disattivato"}
          </label>
        </div>
        {timerEnabled && (
          <div className="flex items-center sm:ml-4 space-x-2">
            <input
              type="number"
              value={timerDuration}
              onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
              min="5"
              max="300"
              className="px-3 py-2 border border-gray-300 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-600">Secondi per domanda</span>
          </div>
        )}
      </div>
    </div>
  );
};
