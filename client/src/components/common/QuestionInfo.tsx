// QuestionInfo.tsx
/**
 * QuestionInfo Component
 *
 * Questo componente visualizza le informazioni sulla domanda corrente in un quiz.
 * Mostra il numero della domanda corrente e il numero totale di domande.
 *
 * @param {number} currentQuestionIndex - L'indice della domanda corrente (a partire da 0).
 * @param {number} totalQuestions - Il numero totale di domande nel quiz.
 * @param {string} [className] - Classi CSS aggiuntive per lo stile del componente.
 * @param {number} score - Il punteggio attuale dell'utente.
 *
 * Usage:
 * Questo componente è utilizzato in ActiveQuizScreen per mostrare all'utente
 * a che punto è del quiz e il suo punteggio.
 */

import React from "react";

interface QuestionInfoProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  className?: string;
  score: number; // Added score prop
}

const QuestionInfo: React.FC<QuestionInfoProps> = ({
  currentQuestionIndex,
  totalQuestions,
  className,
  score, // Receive score as prop
}) => {
  return (
    <div className={`flex gap-2 text-sm font-medium text-gray-600 ${className}`}>
      <div>
        Domanda {currentQuestionIndex + 1} di {totalQuestions}
      </div>
      {/* Display Punteggio here */}
      <div className="ml-auto">Punteggio: {score}</div>
    </div>
  );
};

export default QuestionInfo;
