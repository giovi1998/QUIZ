// components/common/ReportQuiz.tsx
import React from "react";
import { Report } from "../type/Types.tsx";

interface ReportQuizProps {
  report: Report;
  onRestart: () => void;
}

const ReportQuiz: React.FC<ReportQuizProps> = ({ report, onRestart }) => {
  const formattedDate = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDownloadCSV = () => {
    console.log("Download CSV clicked");
    // Implement CSV download logic here
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 lg:p-10 max-w-3xl mx-4 sm:mx-auto">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
        Computer Vision
      </h2>
      <p className="text-gray-600 mb-6">
        Completato il: <span className="font-medium">{formattedDate}</span>
      </p>

      {report.missed.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Domande sbagliate ({report.missed.length}):</h3>
          <ul className="list-none pl-0">
            {report.missed.map((missed, index) => (
              <li key={index} className="mb-4 p-4 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-800 mb-2">{missed.question}</p>
                <p className="text-red-600 mb-1">
                  ❌ Tua risposta:{" "}
                  <span className="font-normal text-gray-700">
                    {missed.yourAnswer}
                  </span>
                </p>
                {missed.correctAnswer && missed.correctAnswer !== "Nessuna risposta corretta, domanda aperta." && (
                  <p className="text-green-600">
                    ✅ Risposta corretta:{" "}
                    <span className="font-normal text-gray-700">
                      {missed.correctAnswer}
                    </span>
                  </p>
                )}
                {missed.correctAnswer && missed.correctAnswer === "Nessuna risposta corretta, domanda aperta." &&(
                  <p className="text-green-600">
                  <span className="font-medium">Commento:</span>{" "}
                  <span className="font-normal text-gray-700">
                  {missed.correctAnswer}
                  </span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6 border-t pt-6 border-gray-200">
        <p className="text-lg">
          <span className="font-semibold text-gray-800">{report.correctAnswers}</span>/{report.totalQuestions} <span className="text-gray-600">Da migliorare</span>
        </p>
        <p className="text-3xl font-bold text-blue-600">{report.percentage}%</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-6"> {/* Add mt-6 */}
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto"
        >
          Riprova Nuovo Quiz {/* Correct text */}
        </button>
        <button
          onClick={handleDownloadCSV}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-md transition-colors w-full sm:w-auto"
        >
          Scarica Report CSV {/* Correct text */}
        </button>
      </div>
    </div>
  );
};

export default ReportQuiz;
