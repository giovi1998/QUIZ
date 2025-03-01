// EmptyScreen.tsx
import React from "react";
import { FileQuestion } from "lucide-react";
import { EmptyScreenProps } from "../components/type/types";


// Componente visualizzato quando non ci sono domande disponibili
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
        {/* Titolo del quiz */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">{quizName}</h1>
        
        {/* Icona indicativa stato vuoto */}
        <div className="flex items-center justify-center mb-4">
          <FileQuestion size={64} className="text-gray-300" />
        </div>

        {/* Messaggio informativo */}
        <p className="text-gray-500 text-center mb-6">
          Nessuna domanda disponibile. Carica un file o torna al setup.
        </p>

        {/* Pulsanti azione principali */}
        <div className="flex flex-col md:flex-row gap-3">
          {/* Pulsante trigger per upload file */}
          <button
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            Carica Domande
          </button>
          
          {/* Input file nascosto */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Pulsante ritorno al setup */}
          <button
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            onClick={() => setQuizStatus("setup")}
          >
            Torna al Setup
          </button>
        </div>

        {/* Link informazioni formato file */}
        <p 
          className="text-right text-blue-500 text-sm cursor-pointer mt-2" 
          onClick={() => setShowFormatInfo(true)}
        >
          Formato file richiesto
        </p>
      </div>
    </div>
  );
};
