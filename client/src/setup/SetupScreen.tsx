/**
 * SetupScreen Component
 *
 * A modern, interactive quiz configuration interface that allows users to customize their quiz experience.
 * 
 * Features:
 * - Intuitive quiz name input
 * - Mode selection (default or custom)
 * - Advanced settings with timer configuration
 * - File upload for custom questions (JSON/PDF)
 * - Question limit configuration
 * - Responsive design with modern UI elements
 *
 * @component
 * @param {string} quizName - Current quiz name
 * @param {(name: string) => void} setQuizName - Function to update quiz name
 * @param {"default" | "custom"} quizMode - Current quiz mode selection
 * @param {(mode: "default" | "custom") => void} setQuizMode - Function to update quiz mode
 * @param {boolean} timerEnabled - Whether timer is enabled for the quiz
 * @param {(enabled: boolean) => void} setTimerEnabled - Function to toggle timer
 * @param {number} timerDuration - Timer duration in seconds
 * @param {(duration: number) => void} setTimerDuration - Function to update timer duration
 * @param {React.RefObject<HTMLInputElement>} fileInputRef - Reference to JSON file input
 * @param {React.RefObject<HTMLInputElement>} pdfInputRef - Reference to PDF file input
 * @param {(file: File) => Promise<void>} onFileChangeJson - Handler for JSON file upload
 * @param {(file: File) => Promise<void>} onFileChangePdf - Handler for PDF file upload
 * @param {() => void} onSetupComplete - Function called when setup is complete
 * @param {boolean} showFormatInfo - Whether to show format information modal
 * @param {(show: boolean) => void} setShowFormatInfo - Function to toggle format info modal
 * @param {boolean} loading - Whether file upload is in progress
 * @param {string} [uploadError] - Error message from file upload (if any)
 * @param {{ name: string; type: "json" | "pdf" }} [uploadedFile] - Information about uploaded file
 * @param {number} openQuestionsLimit - Maximum number of open questions
 * @param {(limit: number) => void} setOpenQuestionsLimit - Function to update open questions limit
 * @param {number} multipleChoiceQuestionsLimit - Maximum number of multiple choice questions
 * @param {(limit: number) => void} setMultipleChoiceQuestionsLimit - Function to update multiple choice questions limit
 */

import React from "react";
import { FormatInfoModal } from "./FormatInfoModal.tsx";

// Import the modular components
import QuizTitleInput from "../components/setup/QuizTitleInput.tsx";
import QuizModeSelector from "../components/setup/QuizModeSelector.tsx";
import AdvancedSettings from "../components/setup/AdvancedSettings.tsx";
import FileUploadSection from "../components/setup/FileUploadSection.tsx";
import SetupActions from "../components/setup/SetupActions.tsx";

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

  // Enhanced accessibility and modern UI styles
  const accessibilityStyles = `
    /* Focus states for better accessibility */
    button:focus-visible, [role="button"]:focus-visible {
      outline: 2px solid #3b82f6;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5);
    }
    
    /* Neumorphic button styles - toned down brightness */
    .quiz-mode-btn {
      background: linear-gradient(145deg, #f8fafc, #f1f5f9);
      box-shadow: 3px 3px 6px #d1d5db, -3px -3px 6px #ffffff;
      transition: all 0.3s ease;
    }
    
    /* Active state for mode buttons - less bright */
    .quiz-mode-btn.active {
      background: linear-gradient(145deg, #818cf8, #6366f1);
      color: white;
      box-shadow: 3px 3px 6px #c7d2fe, -3px -3px 6px #818cf8;
      transform: translateY(-1px);
    }
    
    /* Hover effects - more subtle */
    .quiz-mode-btn:hover:not(.active) {
      transform: translateY(-1px);
      box-shadow: 4px 4px 8px #d1d5db, -4px -4px 8px #ffffff;
    }
  `;

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 mx-4 max-w-2xl sm:mx-auto space-y-10 animate-fadeIn">
      <style>{accessibilityStyles}</style>

      {/* Title with gradient effect */}
      <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent transition-all duration-300 hover:scale-105 mb-6">
        Configura il tuo Quiz
      </h1>

      {/* Fixed height container to prevent layout shifts */}
      <div className="min-h-[500px] flex flex-col space-y-8">
        {/* Quiz Title Input Component */}
        <div className="mb-6">
          <QuizTitleInput quizName={quizName} setQuizName={setQuizName} />
        </div>

        {/* Quiz Mode Selector Component */}
        <div className="mb-8">
          <QuizModeSelector 
            quizMode={quizMode} 
            setQuizMode={setQuizMode} 
          />
        </div>

        {/* Advanced Settings Component */}
        <div className="mb-8">
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

        {/* Setup Actions Component */}
        <div className="my-8">
          <SetupActions onSetupComplete={onSetupComplete} />
        </div>

        {/* File Upload Section Component (only shown in custom mode) */}
        {quizMode === "custom" && (
          <div className="mt-10">
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
      </div>

      {/* Format Info Modal */}
      {showFormatInfo && (
        <FormatInfoModal onClose={() => setShowFormatInfo(false)} />
      )}
    </div>
  );
};
