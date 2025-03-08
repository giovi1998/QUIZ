// src/components/type/types.ts
import React from "react";

export type QuizStatus = "setup" | "active" | "completed" | "empty";

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: "multiple-choice" | "open";
  userAnswer: string;
  aiScore?: number; // Punteggio da 0 a 3 assegnato dall'AI
}

export interface QuestionFromPdf {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  type: "multiple-choice" | "open";
  answerLetter?: string;
  openAnswer?: string;
  lecture: string;
  questionNumber: string;
}

export interface Report {
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  missed: {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
  }[];
}

export interface FormatInfoModalProps {
  onClose: () => void;
}

export interface EmptyScreenProps {
  quizName?: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setQuizStatus: React.Dispatch<React.SetStateAction<QuizStatus>>;
  setShowFormatInfo: (show: boolean) => void;
}

// Aggiungi un nuovo tipo alla definizione dei tipi
type QuestionType = "multiple-choice" | "open-ended";
