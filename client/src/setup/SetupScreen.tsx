import React from "react";
import { FormatInfoModal } from "../components/setup UI/FormatInfoModal.tsx";
import { Upload } from "lucide-react";
import AdvancedSettings from "../components/setup UI/AdvancedSettings.tsx";
import FileUploadSection from "../components/setup UI/FileUploadSection.tsx";
import QuizNameInput from "../components/setup UI/QuizNameInput.tsx";
import EnhancedQuizModeSelector from "../components/setup UI/EnhancedQuizModeSelector.tsx";
import SetupActions from "../components/setup UI/SetupActions.tsx";


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
      <div className="text-center space-y-3 sm:space-y-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-4 sm:p-6 rounded-xl -mt-6 -mx-6 sm:-mx-8 mb-2 shadow-lg transform hover:shadow-xl transition-all duration-300">
        <h1 className="text-xl sm:text-3xl font-bold text-white drop-shadow-md">
          Configura il tuo Quiz
        </h1>
        {quizName && (
          <p className="text-blue-50 text-sm sm:text-lg animate-fadeIn">
            Il tuo quiz si chiamerà <span className="font-medium text-white bg-blue-600 bg-opacity-30 px-2 sm:px-3 py-0.5 sm:py-1 rounded-md shadow-sm">"{quizName}"</span>
          </p>
        )}
      </div>
      
      {/* Quiz Name Input */}
      <QuizNameInput 
        quizName={quizName}
        setQuizName={setQuizName}
      />

      {/* Quiz Mode Selector */}
      <EnhancedQuizModeSelector 
        quizMode={quizMode}
        setQuizMode={setQuizMode}
      />

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
        <div className="animate-fadeIn">
          <FileUploadSection
            fileInputRef={fileInputRef}
            pdfInputRef={pdfInputRef}
            onFileChangeJson={onFileChangeJson}
            onFileChangePdf={onFileChangePdf}
            loading={loading}
            uploadError={uploadError}
            uploadedFile={uploadedFile}
            showFormatInfo={showFormatInfo}
            setShowFormatInfo={setShowFormatInfo}
            openQuestionsLimit={openQuestionsLimit}
            multipleChoiceQuestionsLimit={multipleChoiceQuestionsLimit}
          />
        </div>
      )}

      {/* Action Buttons */}
      <SetupActions 
        onSetupComplete={onSetupComplete} 
      />

      {/* Format Info Modal */}
      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
};
