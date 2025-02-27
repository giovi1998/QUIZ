// components/setupQuiz/ModeSelector.tsx
import React from 'react';

type ModeSelectorProps = {
  quizMode: "default" | "custom";
  setQuizMode: (mode: "default" | "custom") => void;
};

export const ModeSelector: React.FC<ModeSelectorProps> = ({ quizMode, setQuizMode }) => {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-2">Modalità Quiz</label>
      <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <div className="flex items-center">
          <input
            id="custom-mode"
            type="checkbox"
            checked={quizMode === "custom"}
            onChange={(e) => setQuizMode(e.target.checked ? "custom" : "default")}
            className="form-checkbox h-5 w-5 text-blue-500"
          />
          <label htmlFor="custom-mode" className="ml-2 text-gray-700 cursor-pointer">
            Modalità Personalizzata
          </label>
        </div>
        <span className="text-sm text-gray-500">
          {quizMode === "custom"
            ? "Carica le tue domande personalizzate"
            : "Usa domande predefinite su Visione Artificiale"}
        </span>
      </div>
    </div>
  );
};
