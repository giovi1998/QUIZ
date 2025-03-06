// CompletedScreen.tsx migliorato
import React, { useEffect } from "react";
import { Smile, Download } from "lucide-react";
import { Report } from "../components/type/Types";

interface Props {
  quizName: string;
  report: Report;
  resetQuiz: () => void;
  backToSetup: () => void;
}

export const CompletedScreen: React.FC<Props> = ({
  quizName,
  report,
  resetQuiz,
  backToSetup,
}) => {
  // Log when the component is rendered
  useEffect(() => {
    console.log(`CompletedScreen rendered for quiz: ${quizName}`);
    console.log(
      `Score: ${report.correctAnswers}/${report.totalQuestions} (${report.percentage}%)`
    );
  }, [quizName, report]);

  // Funzione per scaricare il report come PDF o CSV
  const downloadReport = (format: "pdf" | "csv") => {
    if (format === "csv") {
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "Quiz: " + quizName + "\n";
      csvContent += "Completato il: " + new Date().toLocaleDateString() + "\n";
      csvContent +=
        "Punteggio: " +
        report.correctAnswers +
        "/" +
        report.totalQuestions +
        " (" +
        report.percentage +
        "%)\n\n";

      if (report.missed.length > 0) {
        csvContent += "Domande sbagliate:\n";
        csvContent += "Domanda,Tua risposta,Risposta corretta\n";

        report.missed.forEach((item) => {
          csvContent += `"${item.question}","${item.yourAnswer}","${item.correctAnswer}"\n`;
        });
      }

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${quizName}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white p-4 md:p-8 rounded-lg shadow-2xl max-w-md mx-auto space-y-4 md:space-y-6">
      <div className="flex items-center justify-center mb-2 md:mb-4">
        <Smile
          size={48}
          className={`${
            report.percentage >= 70 ? "text-green-500" : "text-red-500"
          } 
          ${
            report.missed.length === 0 ? "animate-bounce" : "animate-pulse"
          }`}
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
      <div className="bg-gray-50 p-4 md:p-6 rounded-lg text-center space-y-3 md:space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xl md:text-2xl font-semibold">
            {report.correctAnswers}/{report.totalQuestions}
          </span>
          <span
            className={`text-sm font-bold px-2 py-1 rounded ${
              report.percentage >= 70
                ? "bg-green-100 text-green-600"
                : "bg-red-100 text-red-600"
            }`}
          >
            {report.percentage >= 90
              ? "Eccellente!"
              : report.percentage >= 70
              ? "Ottimo!"
              : report.percentage >= 50
              ? "Buono"
              : "Da migliorare"}
          </span>
        </div>
        <div className="text-4xl md:text-5xl font-black text-blue-600">
          {report.percentage}%
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-2 ${
              report.percentage >= 70 ? "bg-green-500" : "bg-red-500"
            } rounded-full`}
            style={{ width: `${report.percentage}%` }}
          />
        </div>
      </div>

      {report.missed.length > 0 && (
        <div className="space-y-3 md:space-y-4">
          <h2 className="text-xl md:text-2xl font-bold text-center mb-2 md:mb-4">
            Domande sbagliate ({report.missed.length})
          </h2>
          <div className="max-h-60 md:max-h-80 overflow-y-auto pr-2">
            {report.missed.map((item, idx) => (
              <div
                key={idx}
                className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 mb-3"
              >
                <div className="text-base md:text-lg font-medium mb-2">
                  {item.question}
                </div>
                <div className="flex items-center mb-1 text-red-500 text-sm">
                  ❌ Tua risposta: {item.yourAnswer}
                </div>
                <div className="flex items-center text-green-500 text-sm">
                  ✅ Risposta corretta: {item.correctAnswer}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
          onClick={() => {
            console.log("Download report button clicked");
            downloadReport("csv");
          }}
          className="flex items-center text-blue-600 text-sm hover:underline"
        >
          <Download size={16} className="mr-1" />
          Scarica Report CSV
        </button>
      </div>
    </div>
  );
};
