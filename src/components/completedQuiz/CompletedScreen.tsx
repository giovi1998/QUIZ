import React, { useEffect } from "react";
import { Smile, Download } from "lucide-react";

import { Report } from "../types.ts";
import { MissedQuestionsList } from "./MissedQuestionsList.tsx";
import { QuizResult } from "./QuizResult.tsx";
import { generateCsv } from "../../utils.ts";

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
  useEffect(() => {
    if (report.totalQuestions > 0) {
      console.log("Quiz completed:", quizName);
      console.log("Report data:", report);
    }
  }, [quizName, report]); // Added report to dependencies


  // Check if report and report.missed are valid
  if (!report || !report.missed) {
    return (
      <div className="bg-white p-4 md:p-8 rounded-lg shadow-2xl max-w-md mx-auto space-y-4 md:space-y-6">
        <p className="text-center">Errore nel calcolo del report</p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-8">
          <button
            className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            onClick={resetQuiz}
          >
            Riprova
          </button>
          <button
            className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
            onClick={backToSetup}
          >
            Nuovo Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-2xl max-w-md mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-center mb-2 md:mb-4">
        <Smile
          size={48}
          className={`${
            report.percentage >= 70 ? "text-green-500" : "text-red-500"
          } ${report.missed.length === 0 ? "animate-bounce" : "animate-pulse"}`}
          strokeWidth={2}
        />
      </div>
      <div className="text-center space-y-1 md:space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {quizName}
        </h1>
        <div className="text-gray-600 text-sm">
          Completato il: {new Date().toLocaleDateString()}
        </div>
      </div>
      <QuizResult report={report} />
      <MissedQuestionsList missed={report.missed} />
      {!report.missed.length && (
        <div className="bg-green-100 p-4 rounded-lg text-center">
          <span className="text-green-500 font-semibold">Perfetto!</span> Hai
          risposto correttamente a tutte le domande!
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 mt-4 md:mt-8">
        <button
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          onClick={resetQuiz}
        >
          Riprova
        </button>
        <button
          className="w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all"
          onClick={backToSetup}
        >
          Nuovo Quiz
        </button>
      </div>
      <div className="flex justify-center mt-2">
        <button
          onClick={() => generateCsv(quizName, report)}
          className="flex items-center text-blue-600 text-sm hover:underline"
        >
          <Download size={16} className="mr-1" />
          Scarica Report CSV
        </button>
      </div>
    </div>
  );
};
