import React from "react";
import { Report, Question } from "../type/Types.tsx";

interface ReportQuizProps {
  report: Report;
  backToSetup: () => void;
  questions: Question[]; // Add questions prop here
}

const ReportQuiz: React.FC<ReportQuizProps> = ({
  report,
  backToSetup,
  questions, // Destructure questions prop
}) => {
  const formattedDate = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDownloadCSV = () => {
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

    const csvContent = [
      ["Quiz", "Computer Vision"], // Hardcoded quiz name
      ["Data completamento", formattedDate],
      ["Punteggio", `${report.correctAnswers}/${report.totalQuestions} (${report.percentage}%)`],
      [],
      ["Domanda", "Tua risposta", "Risposta corretta", "Punteggio AI (Se Applicabile)"],
      ...report.missed.map(item => {
        const question = questions.find(q => q.question === item.question);
        const aiScore = question?.aiScore !== undefined ? question.aiScore : "N/A";
        return [
          escapeCsv(item.question),
          escapeCsv(item.yourAnswer),
          escapeCsv(item.correctAnswer),
          aiScore
        ];
      })
    ]
    .map(row => row.join(","))
    .join("\r\n");
  
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `Computer_Vision_report.csv`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

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
            Domande da rivedere ({report.missed.length}):
          </h2>
          <div className="space-y-4">
            {report.missed.map((missed, index) => {
              // Find the corresponding question object
              const question = questions.find(q => q.question === missed.question);
              // Get the aiScore from the question object
              const aiScore = question?.aiScore;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <p className="font-bold mb-2">{missed.question}</p>
                  <p className="text-red-600 mb-1">
                    <span className="emoji mr-2" aria-hidden="true">❌</span>
                    Tua risposta: <span className="font-normal">{missed.yourAnswer}</span>
                  </p>
                  {missed.correctAnswer && (
                    <p className="text-green-600 mb-1">
                      <span className="emoji mr-2" aria-hidden="true">✅</span>
                      Risposta corretta: <span className="font-normal">{missed.correctAnswer}</span>
                    </p>
                  )}
                  {aiScore !== undefined && (
                    <p className="text-blue-600">
                      <span className="emoji mr-2" aria-hidden="true">🤖</span>
                      Punteggio AI: <span className="font-normal">{aiScore}/3</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mt-6">
        <button
          onClick={backToSetup}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded flex-1"
        >
          Nuovo Quiz
        </button>
      </div>
    </div>
  );
};

export default ReportQuiz;
