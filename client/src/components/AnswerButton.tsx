/**
 * AnswerButton Component
 *
 * Questo componente rappresenta un pulsante per inviare la risposta selezionata in un quiz.
 * Il pulsante è abilitato solo se è stata selezionata una risposta.
 *
 * @param {string | null} selectedAnswer - La risposta selezionata dall'utente. Può essere null se nessuna risposta è stata selezionata.
 * @param {(answer: string | null) => void} handleAnswer - La funzione da chiamare quando il pulsante viene cliccato, passando la risposta selezionata.
 *
 * Usage:
 * Questo componente viene utilizzato in ActiveQuizScreen per permettere all'utente di inviare la risposta selezionata.
 */

import React from "react";

export interface AnswerButtonProps {
  selectedAnswer: string | null;
  handleAnswer: (answer: string | null) => void;
}
 

const AnswerButton: React.FC<AnswerButtonProps> = ({
  selectedAnswer,
  handleAnswer,
}) => {
  return (
    <button
      className={`w-full py-3 rounded-lg text-white font-semibold 
        ${selectedAnswer ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"}`}
      onClick={() => handleAnswer(selectedAnswer)}
      disabled={!selectedAnswer}
      style={{ boxShadow: selectedAnswer ? "0 8px 15px rgba(0, 100, 255, 0.1)" : "none" }}
    >
      Invia Risposta
    </button>
  );
};

export default AnswerButton;
