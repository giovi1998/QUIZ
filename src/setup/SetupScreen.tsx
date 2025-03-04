// SetupScreen.tsx
import React from "react";
import {
  RotateCcw,
  Info,
  Upload,
  FileText,
  Loader2,
} from "lucide-react";

type SetupScreenProps = {
  quizName: string;
  setQuizName: (name: string) => void;
  quizMode: "default" | "custom";
  setQuizMode: (mode: "default" | "custom") => void;
  timerEnabled: boolean;
  setTimerEnabled: (enabled: boolean) => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  pdfInputRef: React.RefObject<HTMLInputElement>;
  onFileChangeJson: (file: File) => Promise<void>;
  onFileChangePdf: (file: File) => Promise<void>;
  onSetupComplete: () => void;
  showFormatInfo: boolean;
  setShowFormatInfo: (show: boolean) => void; // Corrected prop type
  loading: boolean;
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
  fileInputRef,
  pdfInputRef,
  onFileChangeJson,
  onFileChangePdf,
  onSetupComplete,
  showFormatInfo,
  setShowFormatInfo,
  loading,
}) => {
  const handleFileChangeJson = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileChangeJson(file);
    }
  };

  const handleFileChangePdf = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileChangePdf(file);
    }
  };

  return (
    <div className="setup-container p-4 md:p-6 bg-white rounded-lg shadow-lg mt-4 md:mt-8 space-y-4 md:space-y-6 max-w-md mx-auto">
      {/* Titolo principale */}
      <h1 className="text-xl md:text-2xl font-bold text-center text-gray-800">
        Configura il tuo Quiz
      </h1>

      {/* Nome del Quiz */}
      <div>
        <label
          htmlFor="quiz-name"
          className="block text-gray-700 font-medium mb-2"
        >
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
        <label className="block text-gray-700 font-medium mb-2">
          Modalità Quiz
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <input
              id="custom-mode"
              type="checkbox"
              checked={quizMode === "custom"}
              onChange={(e) =>
                setQuizMode(e.target.checked ? "custom" : "default")
              }
              className="form-checkbox h-5 w-5 text-blue-500"
            />
            <label
              htmlFor="custom-mode"
              className="ml-2 text-gray-700 cursor-pointer"
            >
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
        <label className="block text-gray-700 font-medium mb-2">
          Abilita Timer
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <input
              id="timer-enabled"
              type="checkbox"
              checked={timerEnabled}
              onChange={(e) => setTimerEnabled(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-500"
            />
            <label
              htmlFor="timer-enabled"
              className="ml-2 text-gray-700 cursor-pointer"
            >
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
          <h3 className="font-medium text-gray-700 mb-3">
            Carica le tue domande
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
            {/* Upload file JSON */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all relative">
              <label
                htmlFor="json-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <Upload size={24} className="text-blue-500 mb-2" />
                <span className="text-sm text-center text-gray-700 font-medium">
                  Carica file JSON
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Formato strutturato
                </span>
              </label>
              {/* Overlay di caricamento */}
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 bg-opacity-70 rounded-lg">
                  <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-2" />
                  <span className="text-gray-700">Caricamento in corso...</span>
                </div>
              )}
              <input
                id="json-upload"
                type="file"
                accept=".json"
                ref={fileInputRef}
                onChange={handleFileChangeJson}
                className="hidden"
              />
            </div>

            {/* Upload file PDF */}
            <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all relative">
              <label
                htmlFor="pdf-upload"
                className="flex flex-col items-center justify-center cursor-pointer"
              >
                <FileText size={24} className="text-blue-500 mb-2" />
                <span className="text-sm text-center text-gray-700 font-medium">
                  Carica file PDF
                </span>
                <span className="text-xs text-gray-500 text-center mt-1">
                  Estrazione automatica
                </span>
              </label>
              {/* Overlay di caricamento */}
              {loading && (
                <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center bg-gray-100 bg-opacity-70 rounded-lg">
                  <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-2" />
                  <span className="text-gray-700">Caricamento in corso...</span>
                </div>
              )}
              <input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                ref={pdfInputRef}
                onChange={handleFileChangePdf}
                className="hidden"
              />
            </div>
          </div>
          {/* Button Show Modal */}
          <button
            onClick={ () => setShowFormatInfo(true)}
            className="flex items-center mt-3 text-blue-500 text-xs hover:underline mx-auto"
          >
            <Info size={14} className="mr-1" />
            Formato file richiesto
          </button>
          {/* Modal per informazioni sul formato file */}
          {showFormatInfo && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-2">
                Formati file supportati
              </h3>
              <div className="space-y-2">
                <div>
                  <strong className="text-gray-700">JSON:</strong> Formato
                  strutturato. Assicurarsi che il file contenga un array di
                  oggetti, dove ogni oggetto ha i campi: <code>question</code>,{" "}
                  <code>options</code>, <code>correctAnswer</code>,{" "}
                  <code>explanation</code>.
                </div>
                <div>
                  <strong className="text-gray-700">PDF:</strong> Formato libero.
                  Il sistema proverà ad estrarre le domande usando degli indicatori
                  come le lettere (A,B,C,D) per le risposte, la parola "Risposta"
                  per indicare la risposta corretta e "Spiegazione" per la spiegazione.
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => setShowFormatInfo(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 transition-all"
                >
                  Chiudi
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pulsanti azione */}
      <div className="flex flex-col sm:flex-row sm:space-x-4 justify-center gap-3 mt-6">
        <button
          onClick={onSetupComplete}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
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
    </div>
  );
};
