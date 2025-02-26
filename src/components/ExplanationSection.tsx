// ExplanationSection.tsx
import React from "react";
import { Check, X } from "lucide-react";

// Tipo delle props per il componente ExplanationSection
type ExplanationSectionProps = {
  selectedAnswer: string | null;       // Risposta selezionata dall'utente
  correctAnswer: string;              // Risposta corretta della domanda
  explanation: string;                // Spiegazione della risposta corretta
  nextQuestion: () => void;           // Funzione per passare alla prossima domanda
};

// Componente per la sezione di feedback e spiegazione dopo una risposta
const ExplanationSection: React.FC<ExplanationSectionProps> = ({
  selectedAnswer,
  correctAnswer,
  explanation,
  nextQuestion,
}) => {
  // Calcola se la risposta è corretta per il condizionale
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="mt-8">
      {/* Contenitore principale del feedback */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        {/* Sezione icona e stato risposta */}
        <div className="flex items-center mb-4">
          {isCorrect ? (
            // Feedback risposta corretta
            <div className="flex items-center mr-3">
              <Check 
                size={40} 
                color="#65a30d"  // Verde acceso per indicare successo
                strokeWidth={2} 
                className="mr-1" 
              />
              <span className="text-green-600 font-semibold">Corretto!</span>
            </div>
          ) : (
            // Feedback risposta errata
            <div className="flex items-center mr-3">
              <X 
                size={40} 
                color="#ef4444"  // Rosso acceso per indicare errore
                strokeWidth={2} 
                className="mr-1" 
              />
              <span className="text-red-600 font-semibold">Sbagliato!</span>
            </div>
          )}
        </div>

        {/* Testo esplicativo della risposta */}
        <div className="text-gray-700 text-base">
          {explanation}
        </div>
      </div>

      {/* Pulsante per proseguire al prossimo quesito */}
      <button
        className="w-full py-3 mt-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
        onClick={nextQuestion}
        style={{ boxShadow: "0 8px 15px rgba(0, 100, 255, 0.1)" }}
      >
        Prossima Domanda
      </button>
    </div>
  );
};

export default ExplanationSection;