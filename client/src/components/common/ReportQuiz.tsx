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

  // Determine result message based on percentage
  const getResultMessage = (percentage: number) => {
    if (percentage >= 90) return "Eccellente!";
    if (percentage >= 70) return "Buon risultato";
    if (percentage >= 50) return "Sufficiente";
    return "Da migliorare";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Computer Vision</h1>
        <p className="text-gray-600">Completato il: {formattedDate}</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold">
            {report.correctAnswers}/{report.totalQuestions} {getResultMessage(report.percentage)}
          </div>
          <div className="text-3xl font-bold text-blue-600">{report.percentage}%</div>
        </div>
      </div>

      {report.missed.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Domande sbagliate ({report.missed.length}):
          </h2>
          <div className="space-y-4">
            {report.missed.map((missed, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <p className="font-bold mb-2">{missed.question}</p>
                <p className="text-red-600 mb-1">
                  ❌ Tua risposta:{" "}
                  <span className="font-normal">{missed.yourAnswer}</span>
                </p>
                {missed.correctAnswer && missed.correctAnswer !== "Nessuna risposta corretta, domanda aperta." && (
                  <p className="text-green-600">
                    ✅ Risposta corretta:{" "}
                    <span className="font-normal">{missed.correctAnswer}</span>
                  </p>
                )}
                {missed.correctAnswer && missed.correctAnswer === "Nessuna risposta corretta, domanda aperta." && (
                  <p className="text-gray-700">
                    Commento:{" "}
                    <span className="font-normal">{missed.correctAnswer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={onRestart}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex-1"
        >
          Riprova
        </button>
        <button
          onClick={onRestart}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex-1"
        >
          Nuovo Quiz
        </button>
        <button
          onClick={handleDownloadCSV}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex-1"
        >
          Scarica Report CSV
        </button>
      </div>
    </div>
  );
};

export default ReportQuiz;