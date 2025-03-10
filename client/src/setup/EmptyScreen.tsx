// EmptyScreen.tsx
/**
 * EmptyScreen Component
 *
 * Questo componente viene visualizzato quando non ci sono domande caricate nel quiz.
 * Offre all'utente la possibilità di caricare domande tramite file JSON o PDF.
 *
 * @param {string} quizName - Il nome del quiz.
 * @param {React.RefObject<HTMLInputElement>} fileInputRef - Riferimento all'elemento di input del file.
 * @param {(show: boolean) => void} setShowFormatInfo - Funzione per mostrare/nascondere il modale delle informazioni sul formato.
 * @param {(e: ChangeEvent<HTMLInputElement>) => void} handleFileUpload - Funzione per gestire il caricamento del file JSON.
 * @param {(file: File) => Promise<void>} [handlePdfUpload] - Funzione opzionale per gestire il caricamento del file PDF.
 *
 * Usage:
 * Questo componente è utilizzato in QuizLoader quando non ci sono domande caricate e il quiz è in stato "empty".
 */
import React, { ChangeEvent, useCallback } from "react";
import { Upload, FileText, Info } from "lucide-react";
import { EmptyScreenProps } from "../components/type/Types";

export const EmptyScreen: React.FC<
  Omit<EmptyScreenProps, "handlePdfUpload"> & {
    handlePdfUpload?: (file: File) => Promise<void>;
  }
> = ({
  quizName,
  fileInputRef,
  setShowFormatInfo,
  handleFileUpload,
  handlePdfUpload,
}) => {
    const handleFileChangeJson = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        handleFileUpload(e);
    }, [handleFileUpload]);

    const handleFileChangePdf = useCallback((e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (handlePdfUpload) {
        handlePdfUpload(file);
      }
    }, [handlePdfUpload]);
    
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {quizName} - Nessuna Domanda Trovata
      </h1>
      <p className="text-gray-600 mb-4">
        Non hai ancora caricato delle domande. Carica un file JSON o PDF per
        iniziare.
      </p>
      <div className="flex space-x-4">
        {/* Bottone per caricare file JSON */}
        <label
          htmlFor="json-upload-empty"
          className="flex flex-col items-center px-4 py-3 bg-white text-blue-600 rounded-lg shadow-md cursor-pointer"
        >
          <Upload size={24} className="mb-2" />
          <span className="text-sm">Carica JSON</span>
        </label>
        <input
          id="json-upload-empty"
          type="file"
          accept=".json"
          ref={fileInputRef}
          onChange={handleFileChangeJson}
          className="hidden"
        />

        {/* Bottone per caricare file PDF */}
        <label
          htmlFor="pdf-upload-empty"
          className="flex flex-col items-center px-4 py-3 bg-white text-blue-600 rounded-lg shadow-md cursor-pointer"
        >
          <FileText size={24} className="mb-2" />
          <span className="text-sm">Carica PDF</span>
        </label>
        <input
          id="pdf-upload-empty"
          type="file"
          accept=".pdf"
          ref={fileInputRef}
          onChange={handleFileChangePdf}
          className="hidden"
        />
      </div>
      <div className="flex items-center justify-center mt-6">
        <button
          onClick={() => setShowFormatInfo(true)}
          className="flex items-center mt-3 text-blue-500 text-xs hover:underline mx-auto"
        >
          <Info size={14} className="mr-1" />
          Formato file richiesto
        </button>
      </div>
    </div>
  );
};
