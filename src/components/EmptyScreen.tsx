// EmptyScreen.tsx
import React from "react";
import { FileQuestion } from "lucide-react";

type EmptyScreenProps = {
  quizName: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setQuizStatus: (status: string) => void;
  setShowFormatInfo: (show: boolean) => void;
};

export const EmptyScreen: React.FC<EmptyScreenProps> = ({
  quizName,
  fileInputRef,
  handleFileUpload,
  setQuizStatus,
  setShowFormatInfo,
}) => {
  return (
    <div className="empty-screen p-6 bg-white rounded-lg shadow-md mt-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">{quizName}</h1>
        <div className="flex items-center justify-center mb-4">
          <FileQuestion size={64} className="text-gray-300" />
        </div>
        <p className="text-gray-500 text-center mb-6">
          Nessuna domanda disponibile. Carica un file o torna al setup.
        </p>
        <div className="flex flex-col md:flex-row gap-3">
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            Carica Domande
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            onClick={() => setQuizStatus("setup")}
          >
            Torna al Setup
          </button>
        </div>
        <p className="text-right text-blue-500 text-sm cursor-pointer mt-2" onClick={() => setShowFormatInfo(true)}>
          Formato file richiesto
        </p>
      </div>
    </div>
  );
};