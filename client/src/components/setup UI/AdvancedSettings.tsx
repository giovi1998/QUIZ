/**
 * AdvancedSettings Component
 *
 * A modern, collapsible settings panel for configuring advanced quiz options.
 * 
 * Features:
 * - Smooth animations for expand/collapse
 * - Interactive toggle switches with visual feedback
 * - Intuitive number input controls with increment/decrement buttons
 * - Responsive design with consistent styling
 *
 * @component
 * @param {boolean} timerEnabled - Whether the timer is enabled
 * @param {(enabled: boolean) => void} setTimerEnabled - Function to update timer enabled state
 * @param {number} timerDuration - The duration of the timer in seconds
 * @param {(duration: number) => void} setTimerDuration - Function to update timer duration
 * @param {number} openQuestionsLimit - The maximum number of open questions
 * @param {(limit: number) => void} setOpenQuestionsLimit - Function to update open questions limit
 * @param {number} multipleChoiceQuestionsLimit - The maximum number of multiple choice questions
 * @param {(limit: number) => void} setMultipleChoiceQuestionsLimit - Function to update multiple choice questions limit
 * @param {boolean} showAdvanced - Whether to show advanced settings
 * @param {(show: boolean) => void} setShowAdvanced - Function to toggle advanced settings visibility
 */

import React from "react";
import { ChevronDown, Minus, Plus, Clock, Settings } from "lucide-react";

interface AdvancedSettingsProps {
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  openQuestionsLimit: number;
  setOpenQuestionsLimit: (limit: number) => void;
  multipleChoiceQuestionsLimit: number;
  setMultipleChoiceQuestionsLimit: (limit: number) => void;
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  openQuestionsLimit,
  setOpenQuestionsLimit,
  multipleChoiceQuestionsLimit,
  setMultipleChoiceQuestionsLimit,
  showAdvanced,
  setShowAdvanced,
}) => {
  return (
    <div className="space-y-4">
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md group"
        aria-expanded={showAdvanced}
      >
        <div className="flex items-center">
          <Settings className="w-5 h-5 mr-2 text-blue-500 group-hover:rotate-90 transition-transform duration-500" />
          <span className="font-medium text-gray-700">
            Impostazioni Avanzate
          </span>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
            showAdvanced ? "rotate-180" : ""
          }`}
        />
      </button>

      {showAdvanced && (
        <div className="pl-4 border-l-4 border-blue-200 space-y-6 animate-fadeIn">
          {/* Timer Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-gray-700">
                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                <span>Abilita Timer</span>
              </label>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
                  timerEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
                aria-pressed={timerEnabled}
                aria-label={timerEnabled ? "Disabilita timer" : "Abilita timer"}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                    timerEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {timerEnabled && (
              <div className="flex items-center gap-4 pl-6 animate-fadeIn">
                <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow transition-shadow duration-300">
                  <button 
                    onClick={() => setTimerDuration(Math.max(5, timerDuration - 5))}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label="Diminuisci durata timer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={timerDuration}
                    onChange={(e) =>
                      setTimerDuration(Math.max(5, Number(e.target.value)))
                    }
                    className="w-16 text-center py-2 border-x-2 border-gray-100 focus:outline-none"
                    min="5"
                    max="300"
                    aria-label="Durata timer in secondi"
                  />
                  <button 
                    onClick={() => setTimerDuration(Math.min(300, timerDuration + 5))}
                    className="px-3 py-2 text-gray-500 hover:bg-gray-100 transition-colors"
                    aria-label="Aumenta durata timer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-600">secondi per domanda</span>
              </div>
            )}
          </div>

          {/* Question Limits */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Limiti Domande</h4>
            
            {/* Open question limit */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 text-sm">
                Massimo di domande aperte
              </label>
              <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenQuestionsLimit(Math.max(0, openQuestionsLimit - 1))}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Diminuisci limite domande aperte"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{openQuestionsLimit}</span>
                <button
                  onClick={() => setOpenQuestionsLimit(openQuestionsLimit + 1)}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Aumenta limite domande aperte"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Multiple choice question limit */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700 text-sm">
                Massimo di domande a scelta multipla
              </label>
              <div className="flex items-center bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
                <button
                  onClick={() => setMultipleChoiceQuestionsLimit(Math.max(0, multipleChoiceQuestionsLimit - 1))}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Diminuisci limite domande a scelta multipla"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center">{multipleChoiceQuestionsLimit}</span>
                <button
                  onClick={() => setMultipleChoiceQuestionsLimit(multipleChoiceQuestionsLimit + 5)}
                  className="px-3 py-1 text-gray-500 hover:bg-gray-100 transition-colors"
                  aria-label="Aumenta limite domande a scelta multipla"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSettings;