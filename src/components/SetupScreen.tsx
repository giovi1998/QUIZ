// SetupScreen.tsx
import React from "react";
import { RotateCcw, Info, Upload, FileText } from "lucide-react";
import { FormatInfoModal } from "./FormatInfoModal.tsx";

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
  pdfInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
  pdfInputRef,
  handleFileUpload,
  handlePdfUpload,
  onSetupComplete,
  showFormatInfo,
  setShowFormatInfo,
}) => {
  const handleQuizNameChange = (name: string) => {
    console.log("Quiz name changed to:", name);
    setQuizName(name);
  };

  const handleQuizModeChange = (mode: "default" | "custom") => {
    console.log("Quiz mode changed to:", mode);
    setQuizMode(mode);
  };

  const handleTimerEnabledChange = (enabled: boolean) => {
    console.log("Timer enabled:", enabled);
    setTimerEnabled(enabled);
  };

  const handleTimerDurationChange = (duration: number) => {
    console.log("Timer duration changed to:", duration);
    setTimerDuration(duration);
  };

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File uploaded:", e.target.files);
    handleFileUpload(e);
  };

  const handlePdfUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("PDF uploaded:", e.target.files);
    handlePdfUpload(e);
  };

  const handleSetupComplete = () => {
    console.log("Setup complete, starting quiz...");
    onSetupComplete();
  };

  return (

    <div className="setup-container p-4 md:p-6 bg-white rounded-lg shadow-lg mt-4 md:mt-8 space-y-4 md:space-y-6 max-w-md mx-auto">
      {/* Titolo principale */}
      <h1 className="text-xl md:text-2xl font-bold text-center text-gray-800">
        Configura il tuo Quiz
      </h1>

      {/* Nome del Quiz */}
      <div>
        <label htmlFor="quiz-name" className="block text-gray-700 font-medium mb-2">
          Nome del Quiz
        </label>
        <input
          id="quiz-name"
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Inserisci il nome del tuo quiz"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Modalità Quiz */}
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

      {/* Configurazione Timer */}
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

      {/* Caricamento domande personalizzate */}
      {quizMode === "custom" && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-3">Carica le tue domande</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Upload file JSON */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
              <label htmlFor="json-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <Upload size={24} className="text-blue-500 mb-2" />
                <span className="text-sm text-center text-gray-700 font-medium">
                  Carica file JSON
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Formato strutturato
                </span>
              </label>
              <input
                id="json-upload"
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Upload file PDF */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
              <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center cursor-pointer">
                <FileText size={24} className="text-blue-500 mb-2" />
                <span className="text-sm text-center text-gray-700 font-medium">
                  Carica file PDF
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Estrazione automatica
                </span>
              </label>
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                ref={pdfInputRef}
                onChange={handlePdfUpload}
                className="hidden"
              />
            </div>
          </div>

          {questions.length > 0 && (
            <div className="mt-3 bg-green-50 p-2 rounded-lg">
              <span className="flex items-center justify-center text-green-600 text-sm font-medium">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {questions.length} domande caricate con successo
              </span>
            </div>
          )}

          <button
            onClick={() => setShowFormatInfo(true)}
            className="flex items-center mt-3 text-blue-500 text-xs hover:underline mx-auto"
          >
            <Info size={14} className="mr-1" />
            Formato file richiesto
          </button>
        </div>
      )}

      {/* Pulsanti azione */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 justify-center gap-3 mt-6">
        <button
          onClick={onSetupComplete}
          disabled={quizMode === "custom" && questions.length === 0}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Inizia Quiz
        </button>
        <button
          onClick={() => window.location.reload()}
          className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center gap-1"
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </button>
      </div>

      {/* Modal per informazioni sul formato file */}
      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
};
