// SetupScreen.tsx
import React from "react";
import { RotateCcw, Info, Upload } from "lucide-react";

type SetupScreenProps = {
  quizName: string;
  setQuizName: (name: string) => void;
  quizMode: "default" | "custom";
  setQuizMode: (mode: "default" | "custom") => void;
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  questions: any[];
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetupComplete: () => void;
  showFormatInfo: boolean;
  setShowFormatInfo: (show: boolean) => void;
};

export const SetupScreen: React.FC<SetupScreenProps> = ({
  quizName,
  setQuizName,
  quizMode,
  setQuizMode,
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  questions,
  fileInputRef,
  handleFileUpload,
  onSetupComplete,
  showFormatInfo,
  setShowFormatInfo,
}) => {
  return (
    <div className="setup-container p-6 bg-white rounded-lg shadow-md mt-8 space-y-6">
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Configura il tuo Quiz
      </h1>
      
      {/* Nome del Quiz */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Nome del Quiz
        </label>
        <input
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Inserisci il nome del tuo quiz"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      
      {/* Modalità Quiz */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Modalità Quiz
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={quizMode === "custom"}
              onChange={(e) => setQuizMode(e.target.checked ? "custom" : "default")}
              className="h-5 w-5 text-blue-500"
            />
            <span className="ml-2 text-gray-700">
              Modalità Personalizzata
            </span>
          </div>
          <span className="text-sm text-gray-500">
            {quizMode === "custom"
              ? "Carica le tue domande personalizzate"
              : "Usa domande predefinite su Visione Artificiale"}
          </span>
        </div>
      </div>
      
      {/* Timer */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Abilita Timer
        </label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
            className="h-5 w-5 text-blue-500"
          />
          <span className="ml-2 text-gray-700">
            {timerEnabled ? "Attivo" : "Disattivato"}
          </span>
          {timerEnabled && (
            <div className="flex items-center ml-4 space-x-2">
              <input
                type="number"
                value={timerDuration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
                className="px-3 py-2 border border-gray-300 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">Secondi per domanda</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Caricamento domande personalizzate */}
      {quizMode === "custom" && (
        <div>
          <div>
            <label 
              htmlFor="file-upload"
              className="flex items-center justify-center mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-all"
            >
              <Upload size={20} className="mr-2" />
              Carica domande (JSON)
            </label>
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            {questions.length > 0 && (
              <span className="block mt-1 text-green-500 text-sm">
                {questions.length} domande caricate
              </span>
            )}
          </div>
          <button
            onClick={() => setShowFormatInfo(true)}
            className="flex items-center mt-2 text-blue-500 text-xs hover:underline"
          >
            <Info size={14} className="mr-1" />
            Formato file richiesto
          </button>
        </div>
      )}
      
      {/* Azioni */}
      <div className="flex flex-col md:flex-row md:space-x-4 justify-center mt-6">
        <button
          onClick={onSetupComplete}
          disabled={quizMode === "custom" && questions.length === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-400"
        >
          Inizia Quiz
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-1"
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </button>
      </div>
    </div>
  );
};
