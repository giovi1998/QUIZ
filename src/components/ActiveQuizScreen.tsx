// components/ActiveQuizScreen.tsx
import React from "react";
import ProgressBar from "./ProgressBar.tsx";
import TimerDisplay from "./TimerDisplay.tsx";
import QuestionInfo from "./QuestionInfo.tsx";
import AnswerButton from "./AnswerButton.tsx";
import ExplanationSection from "./ExplanationSection.tsx";
import type { Question } from "../App.tsx";

// Stili CSS per l'animazione di evidenziazione delle risposte
const styles = `
@keyframes highlightAnim {
  0% { background-size: 0% 100%; }
  100% { background-size: 100% 100%; }
}

.highlighted {
  background-image: linear-gradient(to right, #fef08a 0%, #fef08a 100%);
  background-repeat: no-repeat;
  background-position: left center;
  animation: highlightAnim 0.3s ease-out;
}
`;

// Props per il componente OptionSquare
type OptionSquareProps = {
  option: string;         // Testo dell'opzione
  selected: boolean;      // Stato di selezione
  onSelect: () => void;   // Gestore click
};

// Componente per visualizzare una singola opzione di risposta
const OptionSquare: React.FC<OptionSquareProps> = ({ option, selected, onSelect }) => {
  return (
    <div 
      className="flex items-center cursor-pointer group w-full"
      onClick={onSelect}
    >
      <div className={`flex items-center w-full p-3 rounded-md transition-all duration-200
        ${selected 
          ? "highlighted border-yellow-400" 
          : "hover:bg-gray-50"}`}
      >
        <span className={`text-lg relative z-10 flex-1
          ${selected ? "text-gray-800 font-medium" : "text-gray-700"}`}
        >
          {option}
        </span>
      </div>
    </div>
  );
};

// Props per il componente ActiveQuizScreen
type ActiveQuizScreenProps = {
  quizName: string;                      // Nome del quiz
  currentQuestionIndex: number;          // Indice domanda corrente
  totalQuestions: number;                // Numero totale domande
  score: number;                         // Punteggio corrente
  question: Question;                    // Dati della domanda corrente
  selectedAnswer: string | null;         // Risposta selezionata
  setSelectedAnswer: (answer: string | null) => void; // Setter risposta
  showExplanation: boolean;              // Stato visualizzazione spiegazione
  handleAnswer: (answer: string | null) => void; // Gestore invio risposta
  nextQuestion: () => void;              // Funzione prossima domanda
  timeRemaining: number;                 // Tempo rimanente
  timerActive: boolean;                  // Stato attivazione timer
  timerEnabled: boolean;                 // Abilitazione timer
};

// Componente principale per la schermata del quiz attivo
export const ActiveQuizScreen: React.FC<ActiveQuizScreenProps> = ({
  quizName,
  currentQuestionIndex,
  totalQuestions,
  score,
  question,
  selectedAnswer,
  setSelectedAnswer,
  showExplanation,
  handleAnswer,
  nextQuestion,
  timeRemaining,
  timerActive,
  timerEnabled,
}) => {
  // Calcola la percentuale di progresso del quiz
  const progress = (currentQuestionIndex / totalQuestions) * 100;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6 max-w-md mx-auto">
      <style>{styles}</style>
      
      {/* Barra di avanzamento del quiz */}
      <ProgressBar progress={progress} />

      {/* Header con timer */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">{quizName}</h1>
        {timerEnabled && timerActive && (
          <TimerDisplay 
            timerEnabled={timerEnabled}
            timerActive={timerActive}
            timeRemaining={timeRemaining}
          />
        )}
      </div>

      {/* Informazioni domanda/punteggio */}
      <QuestionInfo 
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={totalQuestions}
        score={score}
      />

      {/* Testo della domanda */}
      <div className="text-xl font-semibold mb-6">
        {question.question}
      </div>

      {/* Lista opzioni di risposta */}
      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <OptionSquare
            key={idx}
            option={option}
            selected={selectedAnswer === option}
            onSelect={() => {
              if (!showExplanation) { // Blocca selezione dopo risposta
                setSelectedAnswer(option);
              }
            }}
          />
        ))}
      </div>

      {/* Mostra pulsante risposta o sezione spiegazione */}
      {!showExplanation && (
        <AnswerButton 
          selectedAnswer={selectedAnswer}
          handleAnswer={handleAnswer}
        />
      )}

      {showExplanation && (
        <ExplanationSection 
          selectedAnswer={selectedAnswer}
          correctAnswer={question.correctAnswer}
          explanation={question.explanation}
          nextQuestion={nextQuestion}
        />
      )}
    </div>
  );
};

export default ActiveQuizScreen;