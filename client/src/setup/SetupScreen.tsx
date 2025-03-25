import React from "react";
import { FormatInfoModal } from "./FormatInfoModal.tsx";
import { Settings, Upload, FileText, Clock, Zap, RotateCcw, CheckCircle, AlertCircle, ChevronDown } from "lucide-react";
import AdvancedSettings from "../components/setup/AdvancedSettings.tsx";


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

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mx-4 max-w-2xl sm:mx-auto space-y-12 border border-gray-100">
      {/* Header Section */}
      <div className="text-center space-y-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-6 rounded-xl -mt-6 -mx-6 sm:-mx-8 mb-2 shadow-lg transform hover:shadow-xl transition-all duration-300">
        <h1 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
          Configura il tuo Quiz
        </h1>
        {quizName && (
          <p className="text-blue-50 text-lg animate-fadeIn">
            Il tuo quiz si chiamerà <span className="font-medium text-white bg-blue-600 bg-opacity-30 px-3 py-1 rounded-md shadow-sm">"{quizName}"</span>
          </p>
        )}
      </div>
      
      {/* Quiz Name Input */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 p-2 rounded-lg shadow-sm">
          <FileText size={16} className="text-blue-500" />
          Nome del Quiz
        </label>
        <div className="relative">
          <input
            type="text"
            value={quizName}
            onChange={(e) => setQuizName(e.target.value)}
            placeholder="Es. Computer Vision"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-3 focus:ring-blue-300 focus:border-blue-500 transition-all duration-300 text-lg shadow-sm hover:shadow-md"
          />
          {quizName && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 animate-scale">
              <CheckCircle size={20} />
            </div>
          )}
        </div>
      </div>

      {/* Quiz Mode Selector */}
      <div className="space-y-6">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg shadow-sm">
          <Zap className="text-blue-500" size={20} />
          Modalità Quiz
        </h2>
        <div className="flex flex-col space-y-6">
          <button
            onClick={() => setQuizMode("default")}
            className={`p-6 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-3 transform hover:scale-[1.03] ${
              quizMode === "default"
                ? "border-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 shadow-lg"
                : "border-gray-200 hover:border-blue-300 hover:shadow-md bg-white"
            }`}
          >
            <div className={`p-3 rounded-full ${quizMode === "default" ? "bg-blue-100 shadow-md" : "bg-gray-100"} transition-colors duration-300`}>
              <Zap className={quizMode === "default" ? "text-blue-500 animate-pulse" : "text-gray-400"} size={24} />
            </div>
            <span className="font-medium text-lg">Predefinita</span>
          </button>
          <button
            onClick={() => setQuizMode("custom")}
            className={`p-6 rounded-lg border-2 transition-all duration-300 flex flex-col items-center gap-3 transform hover:scale-[1.03] ${
              quizMode === "custom"
                ? "border-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 text-purple-700 shadow-lg"
                : "border-gray-200 hover:border-purple-300 hover:shadow-md bg-white"
            }`}
          >
            <div className={`p-3 rounded-full ${quizMode === "custom" ? "bg-purple-100 shadow-md" : "bg-gray-100"} transition-colors duration-300`}>
              <Upload className={quizMode === "custom" ? "text-purple-500 animate-pulse" : "text-gray-400"} size={24} />
            </div>
            <span className="text-sm sm:text-base font-medium text-gray-700">Carica le tue domande</span>
          </button>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="space-y-6">
        <AdvancedSettings
          timerEnabled={timerEnabled}
          setTimerEnabled={setTimerEnabled}
          timerDuration={timerDuration}
          setTimerDuration={setTimerDuration}
          openQuestionsLimit={openQuestionsLimit}
          setOpenQuestionsLimit={setOpenQuestionsLimit}
          multipleChoiceQuestionsLimit={multipleChoiceQuestionsLimit}
          setMultipleChoiceQuestionsLimit={setMultipleChoiceQuestionsLimit}
          showAdvanced={showAdvanced}
          setShowAdvanced={setShowAdvanced}
        />
      </div>

      {/* File Upload Section (only for custom mode) */}
      {quizMode === "custom" && (
        <div className="space-y-8 animate-fadeIn p-4 sm:p-0">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-3 bg-gradient-to-r from-purple-50 to-purple-100 p-3 rounded-lg shadow-sm">
            <Upload className="text-purple-500" size={20} />
            Carica le tue domande
          </h2>
          
          {/* File Upload Cards */}
          <div className="flex flex-col space-y-4 sm:space-y-6">
            {/* JSON Upload */}
            <div className={`border-2 ${uploadedFile?.type === "json" ? "border-green-300 bg-green-50" : "border-gray-200"} rounded-lg p-4 sm:p-5 hover:border-blue-300 transition-all hover:shadow-xl relative transform hover:scale-[1.02] duration-300`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full shadow-md">
                  <FileText className="text-blue-600" size={18} />
                </div>
                <h3 className="font-medium text-base sm:text-lg">Carica JSON</h3>
                {uploadedFile?.type === "json" && (
                  <CheckCircle className="ml-auto text-green-500 animate-scale" size={18} />
                )}
              </div>
              <p className="text-gray-600 mb-4 sm:mb-5 text-sm sm:text-base">
                Formato strutturato per domande personalizzate
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={(e) => e.target.files?.[0] && onFileChangeJson(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${uploadedFile?.type === "json" ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300 shadow-md" : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg"}`}
              >
                {uploadedFile?.type === "json" ? (
                  <>
                    <CheckCircle className="text-green-600" size={16} />
                    {uploadedFile.name}
                  </>
                ) : (
                  <>
                    <Upload size={16} className="animate-bounce" />
                    Seleziona file
                  </>
                )}
              </button>
            </div>
            
            {/* PDF Upload */}
            <div className={`border-2 ${uploadedFile?.type === "pdf" ? "border-green-300 bg-green-50" : "border-gray-200"} rounded-lg p-4 sm:p-5 hover:border-purple-300 transition-all hover:shadow-xl relative transform hover:scale-[1.02] duration-300`}>
              <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full shadow-md">
                  <FileText className="text-purple-600" size={18} />
                </div>
                <h3 className="font-medium text-base sm:text-lg">Carica PDF</h3>
                {uploadedFile?.type === "pdf" && (
                  <CheckCircle className="ml-auto text-green-500 animate-scale" size={18} />
                )}
              </div>
              <p className="text-gray-600 mb-4 sm:mb-5 text-sm sm:text-base">
                Estrazione automatica delle domande dal documento
              </p>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && onFileChangePdf(e.target.files[0])}
                className="hidden"
              />
              <button
                onClick={() => pdfInputRef.current?.click()}
                className={`w-full py-2 sm:py-3 rounded-lg transition-all duration-300 font-medium flex items-center justify-center gap-2 text-sm sm:text-base ${uploadedFile?.type === "pdf" ? "bg-gradient-to-r from-green-100 to-green-200 text-green-700 hover:from-green-200 hover:to-green-300 shadow-md" : "bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 shadow-md hover:shadow-lg"}`}
              >
                {uploadedFile?.type === "pdf" ? (
                  <>
                    <CheckCircle className="text-green-600" size={16} />
                    {uploadedFile.name}
                  </>
                ) : (
                  <>
                    <Upload size={16} className="animate-bounce" />
                    Seleziona file
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Format Info Link */}
          <button
            onClick={() => setShowFormatInfo(true)}
            className="text-blue-600 hover:text-blue-800 hover:underline text-lg flex items-center gap-2 mx-auto mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full transition-all hover:shadow-md transform hover:scale-105"
          >
            <FileText size={16} />
            Formati supportati
          </button>

          {/* Upload Error */}
          {uploadError && (
            <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-lg text-lg flex items-center gap-3 border border-red-200 shadow-sm animate-pulse">
              <AlertCircle size={20} />
              {uploadError}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col space-y-4 pt-6">
        <button
          onClick={onSetupComplete}
          disabled={loading || (quizMode === "custom" && !uploadedFile)}
          className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-300 text-lg shadow-lg ${
            loading || (quizMode === "custom" && !uploadedFile)
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 hover:from-blue-700 hover:via-indigo-600 hover:to-purple-700 text-white hover:shadow-xl transform hover:-translate-y-1"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="animate-pulse">Caricamento...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <Zap size={20} className="text-white" />
              <span>Inizia Quiz</span>
            </div>
          )}
        </button>
        <button
          onClick={() => {
            setQuizName("");
            setQuizMode("default");
            setTimerEnabled(false);
            setTimerDuration(60);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (pdfInputRef.current) pdfInputRef.current.value = "";
          }}
          className="flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-all duration-300 text-lg hover:shadow-lg transform hover:-translate-y-1 hover:border-gray-400"
        >
          <RotateCcw size={20} className="text-gray-500" />
          Reset
        </button>
      </div>

      {/* Format Info Modal */}
      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
};
