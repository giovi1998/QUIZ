// SetupScreen.tsx
import React from "react";
import { RotateCcw, Info, Upload } from "lucide-react";

// Tipo delle props per il componente SetupScreen
type SetupScreenProps = {
  quizName: string;                                       // Nome corrente del quiz
  setQuizName: (name: string) => void;                   // Funzione per aggiornare il nome del quiz
  quizMode: "default" | "custom";                        // Modalità selezionata (predefinita/personalizzata)
  setQuizMode: (mode: "default" | "custom") => void;     // Funzione per cambiare modalità
  timerEnabled: boolean;                                 // Stato di attivazione del timer
  setTimerEnabled: (enabled: boolean) => void;           // Funzione per abilitare/disabilitare il timer
  timerDuration: number;                                 // Durata corrente del timer in secondi
  setTimerDuration: (duration: number) => void;          // Funzione per impostare la durata del timer
  questions: any[];                                      // Array delle domande caricate
  fileInputRef: React.RefObject<HTMLInputElement>;       // Riferimento per l'input file
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Gestore caricamento file
  onSetupComplete: () => void;                           // Funzione per avviare il quiz
  showFormatInfo: boolean;                               // Stato visualizzazione info formato file
  setShowFormatInfo: (show: boolean) => void;            // Funzione per mostrare/nascondere info formato
};

// Componente per la configurazione iniziale del quiz
export const SetupScreen: React.FC<SetupScreenProps> = ({
  quizName,
  setQuizName,
  quizMode,
  setQuizMode,
  timerEnabled,
  setTimerEnabled,
  timerDuration,
  setTimerDuration,
  questions,
  fileInputRef,
  handleFileUpload,
  onSetupComplete,
  showFormatInfo,
  setShowFormatInfo,
}) => {
  return (
    <div className="setup-container p-6 bg-white rounded-lg shadow-md mt-8 space-y-6">
      {/* Titolo principale */}
      <h1 className="text-2xl font-bold text-center text-gray-800">
        Configura il tuo Quiz
      </h1>
      
      {/* Sezione di input per il nome del quiz */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Nome del Quiz
        </label>
        <input
          type="text"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          placeholder="Inserisci il nome del tuo quiz"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
      
      {/* Selezione modalità quiz */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Modalità Quiz
        </label>
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={quizMode === "custom"}
              onChange={(e) => setQuizMode(e.target.checked ? "custom" : "default")}
              className="h-5 w-5 text-blue-500"
            />
            <span className="ml-2 text-gray-700">
              Modalità Personalizzata
            </span>
          </div>
          {/* Messaggio descrittivo modalità */}
          <span className="text-sm text-gray-500">
            {quizMode === "custom"
              ? "Carica le tue domande personalizzate"
              : "Usa domande predefinite su Visione Artificiale"}
          </span>
        </div>
      </div>
      
      {/* Configurazione timer */}
      <div>
        <label className="block text-gray-700 font-medium mb-2">
          Abilita Timer
        </label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={timerEnabled}
            onChange={(e) => setTimerEnabled(e.target.checked)}
            className="h-5 w-5 text-blue-500"
          />
          <span className="ml-2 text-gray-700">
            {timerEnabled ? "Attivo" : "Disattivato"}
          </span>
          {/* Input durata timer (visibile solo se timer abilitato) */}
          {timerEnabled && (
            <div className="flex items-center ml-4 space-x-2">
              <input
                type="number"
                value={timerDuration}
                onChange={(e) => setTimerDuration(parseInt(e.target.value) || 30)}
                className="px-3 py-2 border border-gray-300 rounded-lg w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-600">Secondi per domanda</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Sezione caricamento domande personalizzate (visibile solo in modalità custom) */}
      {quizMode === "custom" && (
        <div>
          <div>
            {/* Pulsante per upload file */}
            <label 
              htmlFor="file-upload"
              className="flex items-center justify-center mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-all"
            >
              <Upload size={20} className="mr-2" />
              Carica domande (JSON)
            </label>
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            {/* Feedback domande caricate */}
            {questions.length > 0 && (
              <span className="block mt-1 text-green-500 text-sm">
                {questions.length} domande caricate
              </span>
            )}
          </div>
          {/* Link informazioni formato file */}
          <button
            onClick={() => setShowFormatInfo(true)}
            className="flex items-center mt-2 text-blue-500 text-xs hover:underline"
          >
            <Info size={14} className="mr-1" />
            Formato file richiesto
          </button>
        </div>
      )}
      
      {/* Sezione pulsanti azione */}
      <div className="flex flex-col md:flex-row md:space-x-4 justify-center mt-6">
        {/* Pulsante inizio quiz (disabilitato se modalità custom senza domande) */}
        <button
          onClick={onSetupComplete}
          disabled={quizMode === "custom" && questions.length === 0}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-400"
        >
          Inizia Quiz
        </button>
        {/* Pulsante reset pagina */}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all flex items-center gap-1"
        >
          <RotateCcw size={14} className="mr-1" />
          Reset
        </button>
      </div>
    </div>
  );
};