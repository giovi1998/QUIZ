// CompletedScreen.tsx
import React from "react";
import { Smile } from "lucide-react";

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

type Props = {
  quizName: string;
  report: Report;
  resetQuiz: () => void;
  backToSetup: () => void;
};

export const CompletedScreen: React.FC<Props> = ({
  quizName,
  report,
  resetQuiz,
  backToSetup,
}) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-md mx-auto space-y-6">
      <div className="flex items-center justify-center mb-4">
        <Smile 
          size={64} 
          color={report.percentage >= 50 ? "#4ade80" : "#ff5e5e"}
          strokeWidth={2}
          className="animate-bounce"
        />
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800">
        {quizName} - Risultati
      </h1>

      <div className="flex items-center justify-center text-gray-600">
        Completato il: {new Date().toLocaleDateString()}
      </div>

      <div className="flex items-baseline justify-center space-x-2">
        <div className="text-5xl font-bold">{report.correctAnswers}</div>
        <div className="text-2xl">/</div>
        <div className="text-2xl font-medium">{report.totalQuestions}</div>
      </div>

      <div className="w-full h-2 bg-gray-200 rounded-full mb-4">
        <div
          className={`h-2 rounded-full ${report.percentage >= 70 ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${report.percentage}%` }}
        />
      </div>

      <div className="flex flex-col items-center space-y-2">
        <div className="text-2xl font-semibold">
          {report.percentage >= 90 
            ? "Eccellente!" 
            : report.percentage >= 70 
              ? "Ottimo!" 
              : report.percentage >= 50 
                ? "Buono" 
                : "Da migliorare"}
        </div>
        <div className="text-gray-600">
          Hai raggiunto il <span className="font-semibold">{report.percentage}%</span>
        </div>
      </div>

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

      {!report.missed.length && (
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <span className="text-green-500 font-semibold">Perfetto!</span> Hai risposto correttamente a tutte le domande!
        </div>
      )}

      <div className="flex items-center justify-center space-x-4 mt-8">
        <button
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          onClick={resetQuiz}
        >
          Riprova
        </button>
        <button
          className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          onClick={backToSetup}
        >
          Nuovo Quiz
        </button>
      </div>
    </div>
  );
};