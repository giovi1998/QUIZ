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
    <div className="max-w-2xl mx-auto mt-8 border rounded shadow p-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold">{quizName}</h1>
        <p className="text-gray-600">Carica delle domande per iniziare</p>
      </header>
      <main className="mt-4 space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="border p-2 rounded"
            />
            <button
              onClick={() => setShowFormatInfo(true)}
              className="flex items-center gap-1 border rounded px-2 py-1 hover:bg-gray-100"
            >
              <FileQuestion className="w-4 h-4" />
              Formato
            </button>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-2 rounded">
            <p className="text-sm text-gray-700">
              Nessuna domanda disponibile. Carica un file di domande o torna al setup.
            </p>
          </div>
          <button
            onClick={() => setQuizStatus("setup")}
            className="border px-4 py-2 rounded hover:bg-gray-100"
          >
            Torna al Setup
          </button>
        </div>
      </main>
    </div>
  );
};
