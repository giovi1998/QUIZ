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
