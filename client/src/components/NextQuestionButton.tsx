// NextQuestionButton.tsx
/**
 * NextQuestionButton Component
 *
 * Questo componente rappresenta un pulsante per passare alla domanda successiva in un quiz.
 * È un componente riutilizzabile che incapsula la logica per avanzare nel quiz.
 *
 * @param {() => void} nextQuestion - La funzione da chiamare quando il pulsante viene cliccato, per passare alla domanda successiva.
 *
 * Usage:
 * Questo componente viene utilizzato in ActiveQuizScreen e ExplanationSection per permettere all'utente di avanzare alla domanda successiva.
 * Quando l'utente ha risposto a una domanda e desidera procedere, questo pulsante viene cliccato per passare alla domanda successiva.
 */

import React from "react";

export interface NextQuestionButtonProps {
  nextQuestion: () => void;
}

const NextQuestionButton: React.FC<NextQuestionButtonProps> = ({ nextQuestion }) => {
  return (
    <button
      className="w-full py-3 mt-6 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
      onClick={nextQuestion}
      style={{ boxShadow: "0 8px 15px rgba(0, 100, 255, 0.1)" }}
    >
      Prossima Domanda
    </button>
  );
};

export default NextQuestionButton;
