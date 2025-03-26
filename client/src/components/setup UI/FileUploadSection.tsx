/**
 * FileUploadSection Component
 *
 * A modern, interactive file upload area for custom quiz questions with visual feedback.
 * 
 * Features:
 * - Animated upload areas with hover effects
 * - Clear visual feedback for upload status (loading, error, success)
 * - Informative tooltips and help text
 * - Accessible controls with proper ARIA attributes
 *
 * @component
 * @param {React.RefObject<HTMLInputElement>} fileInputRef - Reference to the JSON file input
 * @param {React.RefObject<HTMLInputElement>} pdfInputRef - Reference to the PDF file input
 * @param {(file: File) => Promise<void>} onFileChangeJson - Function to handle JSON file upload
 * @param {(file: File) => Promise<void>} onFileChangePdf - Function to handle PDF file upload
 * @param {boolean} loading - Whether a file is currently being processed
 * @param {string} [uploadError] - Error message if file upload failed
 * @param {{ name: string; type: "json" | "pdf" }} [uploadedFile] - Information about the uploaded file
 * @param {boolean} showFormatInfo - Whether to show format information
 * @param {(show: boolean) => void} setShowFormatInfo - Function to toggle format information visibility
 * @param {number} openQuestionsLimit - The maximum number of open questions
 * @param {number} multipleChoiceQuestionsLimit - The maximum number of multiple choice questions
 */

import React from "react";
import { Upload, FileText, Loader2, Info, AlertCircle, CheckCircle2 } from "lucide-react";

interface FileUploadSectionProps {
  fileInputRef: React.RefObject<HTMLInputElement>;
  pdfInputRef: React.RefObject<HTMLInputElement>;
  onFileChangeJson: (file: File) => Promise<void>;
  onFileChangePdf: (file: File) => Promise<void>;
  loading: boolean;
  uploadError?: string;
  uploadedFile?: { name: string; type: "json" | "pdf" };
  showFormatInfo: boolean;
  setShowFormatInfo: (show: boolean) => void;
  openQuestionsLimit: number;
  multipleChoiceQuestionsLimit: number;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  fileInputRef,
  pdfInputRef,
  onFileChangeJson,
  onFileChangePdf,
  loading,
  uploadError,
  uploadedFile,
  showFormatInfo,
  setShowFormatInfo,
  openQuestionsLimit,
  multipleChoiceQuestionsLimit,
}) => {
  const handleFileChangeJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFileChangeJson(file);
  };

  const handleFileChangePdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await onFileChangePdf(file);
  };

  const isUploadDisabled = openQuestionsLimit === 0 && multipleChoiceQuestionsLimit === 0;

  return (
    <div className="bg-gray-50 p-3 sm:p-5 rounded-2xl space-y-3 sm:space-y-4 shadow-inner animate-fadeIn">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* JSON Upload Area */}
        <label 
          className={`flex flex-col items-center justify-center p-2 sm:p-4 bg-white border-2 border-dashed 
                    ${isUploadDisabled ? 'border-gray-200 cursor-not-allowed opacity-60' : 
                      uploadedFile?.type === "json" ? 'border-green-300 bg-green-50' : 
                      'border-gray-300 hover:border-blue-500 hover:bg-blue-50 cursor-pointer'} 
                    rounded-2xl transition-all duration-300 transform hover:scale-[1.01] relative group`}
          aria-disabled={isUploadDisabled}
        >
          <div className="flex flex-col items-center">
            <Upload className={`w-5 h-5 sm:w-7 sm:h-7 mb-0.5 sm:mb-1 ${uploadedFile?.type === "json" ? 'text-green-500' : 'text-blue-500 group-hover:scale-110 transition-transform duration-300'}`} />
            <span className="font-medium text-gray-700 text-sm sm:text-base">Carica JSON</span>
            <input
              type="file"
              ref={fileInputRef}
              disabled={isUploadDisabled}
              onChange={handleFileChangeJson}
              className="hidden"
              accept=".json"
              aria-label="Carica file JSON con domande personalizzate"
            />
          </div>
          
          {uploadedFile?.type === "json" && (
            <div className="absolute top-3 right-3 text-green-500 bg-white rounded-full p-1 shadow-md animate-fadeIn">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          
          {isUploadDisabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-40 rounded-2xl">
              <p className="text-sm text-gray-500 px-4 py-2 bg-white rounded-lg shadow-sm">
                Imposta i limiti di domande nelle impostazioni avanzate
              </p>
            </div>
          )}
        </label>

        {/* PDF Upload Area */}
        <label 
          className={`flex flex-col items-center justify-center p-2 sm:p-4 bg-white border-2 border-dashed 
                    ${isUploadDisabled ? 'border-gray-200 cursor-not-allowed opacity-60' : 
                      uploadedFile?.type === "pdf" ? 'border-green-300 bg-green-50' : 
                      'border-gray-300 hover:border-purple-500 hover:bg-purple-50 cursor-pointer'} 
                    rounded-2xl transition-all duration-300 transform hover:scale-[1.01] relative group`}
          aria-disabled={isUploadDisabled}
        >
          <div className="flex flex-col items-center">
            <FileText className={`w-5 h-5 sm:w-7 sm:h-7 mb-0.5 sm:mb-1 ${uploadedFile?.type === "pdf" ? 'text-green-500' : 'text-purple-500 group-hover:scale-110 transition-transform duration-300'}`} />
            <span className="font-medium text-gray-700 text-sm sm:text-base">Carica PDF</span>
            <input
              type="file"
              ref={pdfInputRef}
              disabled={isUploadDisabled}
              onChange={handleFileChangePdf}
              className="hidden"
              accept=".pdf"
              aria-label="Carica file PDF con domande da estrarre"
            />
          </div>
          
          {uploadedFile?.type === "pdf" && (
            <div className="absolute top-3 right-3 text-green-500 bg-white rounded-full p-1 shadow-md animate-fadeIn">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          
          {isUploadDisabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-40 rounded-2xl">
              <p className="text-sm text-gray-500 px-4 py-2 bg-white rounded-lg shadow-sm">
                Imposta i limiti di domande nelle impostazioni avanzate
              </p>
            </div>
          )}
        </label>
      </div>

      {/* Formati supportati button */}
      <div className="flex justify-center -mt-1 sm:mt-0">
        <button
          type="button"
          onClick={() => setShowFormatInfo(!showFormatInfo)}
          className="flex items-center text-xs sm:text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200 group"
          aria-expanded={showFormatInfo}
        >
          <Info className="w-4 h-4 mr-1 group-hover:text-blue-500" />
          Formati supportati
        </button>
      </div>

      {/* Format info panel */}
      {showFormatInfo && (
        <div className="p-2 sm:p-3 bg-blue-50 rounded-xl border border-blue-200 animate-fadeIn">
          <h4 className="font-medium text-blue-800 text-sm sm:text-base mb-1">Formati supportati:</h4>
          <div className="space-y-1 sm:space-y-2">
            <div>
              <h5 className="font-medium text-blue-700 text-xs sm:text-sm">JSON:</h5>
              <p className="text-blue-600 text-xs sm:text-sm ml-2">File JSON con struttura specifica per domande a risposta aperta e a scelta multipla.</p>
            </div>
            <div>
              <h5 className="font-medium text-blue-700 text-xs sm:text-sm">PDF:</h5>
              <p className="text-blue-600 text-xs sm:text-sm ml-2">Documenti PDF contenenti domande che verranno estratte automaticamente.</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading && (
        <div className="flex items-center justify-center p-2 sm:p-3 bg-blue-50 rounded-xl animate-pulse">
          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mr-2 animate-spin" />
          <span className="text-blue-700 text-xs sm:text-sm">Elaborazione in corso...</span>
        </div>
      )}

      {/* Error message */}
      {uploadError && (
        <div className="flex items-center p-2 sm:p-3 bg-red-50 rounded-xl border border-red-200 animate-fadeIn">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mr-2 flex-shrink-0" />
          <span className="text-red-700 text-xs sm:text-sm">{uploadError}</span>
        </div>
      )}

      {/* Success message */}
      {uploadedFile && !loading && !uploadError && (
        <div className="flex items-center p-2 sm:p-3 bg-green-50 rounded-xl border border-green-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mr-2 flex-shrink-0" />
          <span className="text-green-700 text-xs sm:text-sm">
            File <strong>{uploadedFile.name}</strong> caricato con successo! 
            <span className="font-medium ml-1">{uploadedFile.type === "json" ? "(Formato JSON)" : "(Formato PDF)"}</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;