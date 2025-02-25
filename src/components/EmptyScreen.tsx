import React from "react";
import { FileQuestion } from "lucide-react";
import type { QuizStatus} from "../App.tsx";

type EmptyScreenProps = {
  quizName: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setQuizStatus: (status: QuizStatus) => void; // Usa QuizStatus definito in App
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
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-center">
        <FileQuestion 
          size={64} 
          className="text-gray-300" 
          strokeWidth={1.5}
        />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold mb-2">
          Nessuna domanda disponibile
        </h2>
        <p className="text-gray-600">
          Carica un file JSON oppure torna al setup
        </p>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <label 
          htmlFor="file-upload"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-all"
        >
          <FileQuestion size={24} className="mr-2 inline-block" />
          Carica domande (JSON)
        </label>
        <input
          type="file"
          id="file-upload"
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
      <button
        className="text-right text-blue-500 text-sm hover:underline"
        onClick={() => setShowFormatInfo(true)}
      >
        Formato file richiesto
      </button>
    </div>
  );
};