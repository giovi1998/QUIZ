export type QuizStatus = "setup" | "active" | "completed" | "empty";

export type Question = {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type Report = {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  missed: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
  }[];
};

export type OptionButtonProps = {
  option: string;
  selectedAnswer: string | null;
  showExplanation: boolean;
  setSelectedAnswer: (answer: string | null) => void;
  correctAnswer: string;
};

export type ProgressBarProps = {
    progress: number;
  };

export type TimerDisplayProps = {
  timerEnabled: boolean;
  timerActive: boolean;
  timeRemaining: number;
};

export type AnswerButtonProps = {
  selectedAnswer: string | null;
  handleAnswer: (answer: string | null) => void;
};

// Tipo delle props per il componente ExplanationSection
export type ExplanationSectionProps = {
  selectedAnswer: string | null;       // Risposta selezionata dall'utente
  correctAnswer: string;              // Risposta corretta della domanda
  explanation: string;                // Spiegazione della risposta corretta
  nextQuestion: () => void;           // Funzione per passare alla prossima domanda
};

export type NextQuestionButtonProps = {
    nextQuestion: () => void;
  };

export type Props = {
  quizName: string;
  report: Report;
  resetQuiz: () => void;
  backToSetup: () => void;
};

// Tipo delle props per il componente EmptyScreen
export type EmptyScreenProps = {
  quizName: string;                                      // Nome corrente del quiz
  fileInputRef: React.RefObject<HTMLInputElement>;      // Riferimento per l'input file
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void; // Gestore caricamento file
  setQuizStatus: (status: string) => void;              // Funzione per cambiare lo stato del quiz
  setShowFormatInfo: (show: boolean) => void;           // Funzione per mostrare info formato file
};

// Tipo delle props per il componente FormatInfoModal
export type FormatInfoModalProps = {
    onClose: () => void; // Funzione per chiudere il modal
  };