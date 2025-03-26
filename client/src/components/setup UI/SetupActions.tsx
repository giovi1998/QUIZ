/**
 * SetupActions Component
 *
 * A modern, responsive action button group for quiz setup completion.
 * 
 * Features:
 * - Gradient button styling with hover effects
 * - Responsive layout (stacks on mobile, side-by-side on larger screens)
 * - Animated feedback on interaction
 * - Accessible button labeling
 *
 * @component
 * @param {() => void} onSetupComplete - Function to call when setup is complete and quiz should start
 */

import React from "react";
import { Play, RotateCcw } from "lucide-react";

interface SetupActionsProps {
  onSetupComplete: () => void;
}

const SetupActions: React.FC<SetupActionsProps> = ({ onSetupComplete }) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={onSetupComplete}
        className="flex-1 flex items-center justify-center py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300"
        aria-label="Inizia il quiz con le impostazioni configurate"
      >
        <Play className="w-5 h-5 mr-2 animate-pulse" />
        <span className="font-semibold">Inizia Quiz</span>
      </button>

      <button
        onClick={() => window.location.reload()}
        className="px-6 py-4 flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm hover:shadow-md hover:border-gray-300 duration-300"
        aria-label="Reimposta tutte le impostazioni del quiz"
      >
        <RotateCcw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
        <span className="font-medium">Reset</span>
      </button>
    </div>
  );
};

export default SetupActions;