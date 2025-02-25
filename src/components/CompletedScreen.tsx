import React from "react";
import { Smile } from "lucide-react";

// Tipo per il report dei risultati del quiz
export type Report = {
  totalQuestions: number;         // Numero totale di domande
  correctAnswers: number;         // Risposte corrette
  percentage: number;             // Percentuale di successo
  missed: {                       // Domande sbagliate
    question: string;             // Testo della domanda
    yourAnswer: string;           // Risposta data dall'utente
    correctAnswer: string;        // Risposta corretta
  }[];
};

// Props del componente CompletedScreen
type Props = {
  quizName: string;     // Nome del quiz
  report: Report;       // Dettagli del report
  resetQuiz: () => void;        // Funzione per ripetere il quiz
  backToSetup: () => void;      // Funzione per tornare alla configurazione
};

// Componente per la schermata di completamento quiz
export const CompletedScreen: React.FC<Props> = ({
  quizName,
  report,
  resetQuiz,
  backToSetup,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md mx-auto space-y-6">
      {/* Icona con animazione condizionale */}
      <div className="flex items-center justify-center mb-4">
        <Smile 
          size={64} 
          color={report.percentage >= 70 ? "#4ade80" : "#ff5e5e"} // Colore basato sulla percentuale
          strokeWidth={2}
          className={`animate-bounce ${report.missed.length === 0 ? "rotate-0" : "rotate-[20deg] transition-transform duration-500"}`} // Rotazione se ci sono errori
        />
      </div>

      {/* Intestazione con data */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-800">
          {quizName}
        </h1>
        <div className="text-gray-600">
          Completato il: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Sezione risultati principali */}
      <div className="bg-gray-50 p-6 rounded-lg text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-2xl font-semibold">
            {report.correctAnswers}/{report.totalQuestions}
          </span>
          {/* Etichetta valutazione performance */}
          <span className={`text-sm font-bold px-2 py-1 rounded ${report.percentage >= 70 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {report.percentage >= 90 
              ? "Eccellente!" 
              : report.percentage >= 70 
                ? "Ottimo!" 
                : report.percentage >= 50 
                  ? "Buono" 
                  : "Da migliorare"}
          </span>
        </div>

        {/* Percentuale e barra di progresso */}
        <div className="text-5xl font-black text-blue-600">
          {report.percentage}%
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full">
          <div
            className={`h-2 bg-${report.percentage >= 70 ? 'green-500' : 'red-500'} rounded-full`}
            style={{ width: `${report.percentage}%` }}
          />
        </div>
      </div>

      {/* Sezione domande sbagliate */}
      {report.missed.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-center mb-4">
            Domande sbagliate ({report.missed.length})
          </h2>
          {report.missed.map((item, idx) => (
            <div 
              key={idx} 
              className="p-4 bg-gray-50 rounded-lg shadow-sm space-y-2"
            >
              <div className="text-lg font-medium mb-2">{item.question}</div>
              <div className="flex items-center mb-1 text-red-500">
                ❌ Tua risposta: {item.yourAnswer}
              </div>
              <div className="flex items-center text-green-500">
                ✅ Risposta corretta: {item.correctAnswer}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Messaggio per quiz perfetto */}
      {!report.missed.length && (
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <span className="text-green-500 font-semibold">Perfetto!</span> Hai risposto correttamente a tutte le domande!
        </div>
      )}

      {/* Pulsanti azione */}
      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          onClick={resetQuiz}
        >
          Riprova
        </button>
        <button
          className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
          onClick={backToSetup}
        >
          Nuovo Quiz
        </button>
      </div>
    </div>
  );
};