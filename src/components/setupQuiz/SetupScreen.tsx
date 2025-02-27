// SetupScreen.tsx
import React from "react";
import { RotateCcw } from "lucide-react";
import { FormatInfoModal } from "../FormatInfoModal.tsx";
import { ModeSelector } from "./ModeSelector.tsx";
import { TimerSettings } from "./TimerSettings.tsx";
import { FileUploadSection } from "./FileUploadSection.tsx";
import { UploadInfo } from "./UploadInfo.tsx";

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
      <ModeSelector quizMode={quizMode} setQuizMode={setQuizMode} />

      {/* Configurazione Timer */}
      <TimerSettings
        timerEnabled={timerEnabled}
        setTimerEnabled={setTimerEnabled}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
      />

      {/* Caricamento domande personalizzate */}
      {quizMode === "custom" && (
        <FileUploadSection
          questions={questions}
          fileInputRef={fileInputRef}
          pdfInputRef={pdfInputRef}
          handleFileUpload={handleFileUpload}
          handlePdfUpload={handlePdfUpload}
          setShowFormatInfo={setShowFormatInfo}
        />
      )}
          {/* Mostra informazioni sulle domande caricate */}
        <UploadInfo questions={questions} />

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
      {showFormatInfo && <FormatInfoModal onClose={() => setShowFormatInfo(false)} />}
    </div>
  );
};

