// components/SetupScreen.tsx
import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  Info,
  Upload,
  FileText,
  Loader2,
  Play,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
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
  fileInputRef: React.RefObject<HTMLInputElement>;
  pdfInputRef: React.RefObject<HTMLInputElement>;
  onFileChangeJson: (file: File) => Promise<void>;
  onFileChangePdf: (file: File) => Promise<void>;
  onSetupComplete: () => void;
  showFormatInfo: boolean;
  setShowFormatInfo: (show: boolean) => void;
  loading: boolean;
  uploadError?: string;
  uploadedFile?: { name: string; type: "json" | "pdf" };
  openQuestionsLimit: number;
  setOpenQuestionsLimit: (limit: number) => void;
  multipleChoiceQuestionsLimit: number;
  setMultipleChoiceQuestionsLimit: (limit: number) => void;
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
  uploadError,
  uploadedFile,
  openQuestionsLimit,
  setOpenQuestionsLimit,
  multipleChoiceQuestionsLimit,
  setMultipleChoiceQuestionsLimit,
}) => {
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  // Use the props directly, no need for local state anymore.
  // const [localOpenQuestionsLimit, setLocalOpenQuestionsLimit] = useState<number>(openQuestionsLimit);
  // const [localMultipleChoiceQuestionsLimit, setLocalMultipleChoiceQuestionsLimit] = useState<number>(multipleChoiceQuestionsLimit);

  // Use the props directly, no need for local state anymore.
  // useEffect(() => {
  //   // Update the limits in the parent component when the local state changes
  //   setOpenQuestionsLimit(localOpenQuestionsLimit);
  // }, [localOpenQuestionsLimit, setOpenQuestionsLimit]);

  // useEffect(() => {
  //   // Update the limits in the parent component when the local state changes
  //   setMultipleChoiceQuestionsLimit(localMultipleChoiceQuestionsLimit);
  // }, [localMultipleChoiceQuestionsLimit, setMultipleChoiceQuestionsLimit]);

  const handleFileChangeJson = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) await onFileChangeJson(file);
  };

  const handleFileChangePdf = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) await onFileChangePdf(file);
  };

  const accessibilityStyles = `
    button:focus-visible, [role="button"]:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
    .quiz-mode-btn {
      background: linear-gradient(145deg, #ffffff, #f8fafc);
      box-shadow: 4px 4px 8px #d1d5db, -4px -4px 8px #ffffff;
    }
    .quiz-mode-btn.active {
      background: linear-gradient(145deg, #6366f1, #4f46e5);
      color: white;
      box-shadow: 4px 4px 8px #a5b4fc, -4px -4px 8px #6366f1;
    }
  `;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 mx-4 max-w-2xl sm:mx-auto space-y-8">
      <style>{accessibilityStyles}</style>

      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Configura il tuo Quiz
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Nome del Quiz
        </label>
        <input
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Es: Computer Vision"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="px-1 py-1 bg-white rounded-lg text-sm border border-gray-200">
            {quizMode === "custom" ? "Personalizzata" : "Predefinita"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setQuizMode("default")}
            className={`quiz-mode-btn p-4 rounded-xl border-2 transition-all duration-300 ${
              quizMode === "default"
                ? "active border-blue-500"
                : "border-gray-200 hover:border-blue-200"
            }`}
          >
            <span className="block text-xs text-gray-600 mt-1">
              Domande pre-caricate
            </span>
          </button>

          <button
            onClick={() => setQuizMode("custom")}
            className={`quiz-mode-btn p-4 rounded-xl border-2 transition-all duration-300 ${
              quizMode === "custom"
                ? "active border-purple-500"
                : "border-gray-200 hover:border-purple-200"
            }`}
          >
            <span className="block text-xs text-gray-600 mt-1">
              Carica le tue domande
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all shadow-sm hover:shadow-md"
          aria-expanded={showAdvanced}
        >
          <span className="font-medium text-gray-700">
            Impostazioni Avanzate
          </span>
          <ChevronDown
            className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
              showAdvanced ? "rotate-180" : ""
            }`}
          />
        </button>

        {showAdvanced && (
          <div className="pl-4 border-l-4 border-blue-200 space-y-6">
            {/* Timer Settings */}
            <div className="flex items-center justify-between">
              <label className="flex-1 text-gray-700">Abilita Timer</label>
              <button
                onClick={() => setTimerEnabled(!timerEnabled)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${
                  timerEnabled ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    timerEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {timerEnabled && (
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={timerDuration}
                  onChange={(e) =>
                    setTimerDuration(Math.max(5, Number(e.target.value)))
                  }
                  className="w-24 px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                  min="5"
                  max="300"
                />
                <span className="text-gray-600">secondi per domanda</span>
              </div>
            )}
            {/* Open question limit */}
            <div className="flex items-center justify-between">
              <label className="text-gray-700">
                Massimo di domande aperte
              </label>
              <div className="flex items-center space-x-2">
                <button
                 onClick={() =>
                    {
                      if(!(openQuestionsLimit===0 && multipleChoiceQuestionsLimit === 0)){
                        setOpenQuestionsLimit(Math.max(0, openQuestionsLimit - 1))
                      }
                    }
                  }
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={openQuestionsLimit <= 0}
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-gray-700">{openQuestionsLimit}</span>
                <button
                  onClick={() => setOpenQuestionsLimit(openQuestionsLimit + 1)}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
             {/* Multiple choice question limit */}
             <div className="flex items-center justify-between">
              <label className="text-gray-700">
                Massimo di domande multiple
              </label>
              <div className="flex items-center space-x-2">
                <button
                 onClick={() =>
                    {
                      if(!(openQuestionsLimit===0 && multipleChoiceQuestionsLimit === 0)){
                        setMultipleChoiceQuestionsLimit(Math.max(0, multipleChoiceQuestionsLimit - 1))
                      }
                    }
                  }
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={multipleChoiceQuestionsLimit <= 0}
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-gray-700">{multipleChoiceQuestionsLimit}</span>
                <button
                  onClick={() => setMultipleChoiceQuestionsLimit(multipleChoiceQuestionsLimit + 1)}
                  className="p-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={onSetupComplete}
          className="flex-1 flex items-center justify-center py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all"
        >
          <Play className="w-5 h-5 mr-2" />
          <span className="font-semibold">Inizia Quiz</span>
        </button>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-4 flex items-center justify-center bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm"
        >
          <RotateCcw className="w-5 h-5 mr-2" />
          <span className="font-medium">Reset</span>
        </button>
      </div>

      {quizMode === "custom" && (
        <div className="bg-gray-50 p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-700">Carica Domande</h3>
            <button
              onClick={() => setShowFormatInfo(true)}
              className="text-blue-600 hover:text-blue-700 flex items-center"
            >
              <Info className="w-5 h-5 mr-1" />
              Formati supportati
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 cursor-pointer transition-all group relative">
              <Upload className="w-8 h-8 text-blue-500 mb-2" />
              <span className="font-medium text-gray-700">Carica JSON</span>
              <span className="text-sm text-gray-500">
                Formato strutturato
              </span>
              <input
                type="file"
                ref={fileInputRef}
                disabled={openQuestionsLimit === 0 && multipleChoiceQuestionsLimit === 0}
                onChange={handleFileChangeJson}
                className="hidden"
                accept=".json"
              />
              {uploadedFile?.type === "json" && (
                <div className="absolute bottom-2 right-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </label>

            <label className="flex flex-col items-center justify-center p-6 bg-white border-2 border-dashed border-gray-300 rounded-2xl hover:border-blue-500 cursor-pointer transition-all group relative">
              <FileText className="w-8 h-8 text-blue-500 mb-2" />
              <span className="font-medium text-gray-700">Carica PDF</span>
              <span className="text-sm text-gray-500">
                Estrazione automatica
              </span>
              <input
                type="file"
                ref={pdfInputRef}
                disabled={openQuestionsLimit === 0 && multipleChoiceQuestionsLimit === 0}
                onChange={handleFileChangePdf}
                className="hidden"
                accept=".pdf"
              />
              {uploadedFile?.type === "pdf" && (
                <div className="absolute bottom-2 right-2 text-green-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}
            </label>
          </div>

          {loading && (
            <div className="flex items-center justify-center text-blue-600">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Caricamento in corso...
            </div>
          )}

          {uploadError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
};
