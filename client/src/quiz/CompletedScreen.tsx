// CompletedScreen.tsx
/**
 * CompletedScreen Component
 *
 * Questo componente visualizza la schermata di completamento del quiz, mostrando il report finale con i risultati.
 * Include il punteggio totale, la percentuale di risposte corrette, un elenco delle domande errate con le risposte corrette,
 * e la possibilità di scaricare un report in formato CSV.
 *
 * @param {string} quizName - Il nome del quiz.
 * @param {Report} report - L'oggetto report contenente i risultati del quiz.
 * @param {() => void} backToSetup - Funzione per tornare alla schermata di configurazione del quiz.
 * @param {Question[]} questions - L'array di domande del quiz.
 *
 * Usage:
 * Questo componente è utilizzato in QuizManager quando il quiz è in stato "completed".
 */
import React from "react";
import { Smile, Download, FilePlus } from "lucide-react";
import { Report, Question } from "../components/type/Types.tsx";

interface CompletedScreenProps {
  quizName: string;
  report: Report;
  backToSetup: () => void;
  questions:Question[]; //add question
}

const CompletedScreen: React.FC<CompletedScreenProps> = ({
  quizName,
  report,
  backToSetup,
  questions,//add question
}) => {
  const formattedDate = new Date().toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const handleDownloadCSV = () => {
    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
  
    const csvContent = [
      ["Quiz", escapeCsv(quizName)],
      ["Data completamento", formattedDate],
      ["Punteggio", `${report.correctAnswers}/${report.totalQuestions} (${report.percentage}%)`],
      [],
      ["Domanda", "Tua risposta", "Risposta corretta","Punteggio AI (Se Applicabile)"],
      ...report.missed.map(item => {
        const question = questions.find(q => q.question === item.question);
        const aiScore = question?.aiScore !== undefined ? question.aiScore : "N/A";
        return [
          escapeCsv(item.question),
          escapeCsv(item.yourAnswer),
          escapeCsv(item.correctAnswer),
          aiScore,
        ];
      })
    ]
    .map(row => row.join(","))
    .join("\r\n");
  
    const blob = new Blob(["\ufeff", csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    link.download = `${quizName.replace(/[^a-z0-9]/gi, "_")}_report.csv`;
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  };

  const getResultStatus = (percentage: number) => {
    if (percentage >= 90) return { 
      text: (
        <>
          <span>Eccellente </span>
          <span className="emoji" aria-hidden="true">🎉</span>
        </>
      ),
      color: "text-green-600" 
    };
    if (percentage >= 70) return { 
      text: (
        <>
          <span>Ottimo </span>
          <span className="emoji" aria-hidden="true">👍</span>
        </>
      ),
      color: "text-blue-600" 
    };
    if (percentage >= 50) return { 
      text: (
        <>
          <span>Sufficiente </span>
          <span className="emoji" aria-hidden="true">👏</span>
        </>
      ),
      color: "text-yellow-600" 
    };
    return { 
      text: (
        <>
          <span>Da migliorare </span>
          <span className="emoji" aria-hidden="true">💪</span>
        </>
      ),
      color: "text-red-600" 
    };
  };

  const status = getResultStatus(report.percentage);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mx-4 max-w-2xl md:mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
        <Smile
            size={64}
            className={`${status.color} ${report.missed.length === 0 ? "animate-bounce" : "animate-pulse"}`}
            aria-hidden="true"
          />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">
          {quizName}
        </h1>
        <p className="text-gray-600">Completato il: {formattedDate}</p>
      </div>

      <div className="bg-gray-50 p-6 rounded-xl space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <span className="text-4xl font-bold text-blue-600">
              {report.percentage}%
            </span>
            <span className={`text-lg font-semibold ${status.color}`}>
              {status.text}
            </span>
          </div>
          <div className="text-xl text-gray-700">
            <span className="font-bold">{report.correctAnswers}</span> su{" "}
            <span className="font-bold">{report.totalQuestions}</span> corrette
          </div>
        </div>
        
        <div 
          className="w-full h-3 bg-gray-200 rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={report.percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full transition-all duration-500 ${status.color.replace("text", "bg")}`}
            style={{ width: `${report.percentage}%` }}
          />
        </div>
      </div>

      {report.missed.length > 0 ? (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-center text-gray-800">
            Domande da rivedere ({report.missed.length})
          </h2>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {report.missed.map((item, index) => {
              // Find the corresponding question object
              const question = questions.find(q => q.question === item.question);
               // Get the aiScore from the question object
               const aiScore = question?.aiScore;
              return(
              <div
                key={index}
                className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
              >
                <p className="font-medium text-lg mb-3">{item.question}</p>
                <div className="space-y-2">
                  <div className="flex items-center text-red-600">
                    <span className="emoji mr-2" aria-hidden="true">❌</span>
                    <span>Tua risposta: {item.yourAnswer}</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <span className="emoji mr-2" aria-hidden="true">✅</span>
                    <span>Risposta corretta: {item.correctAnswer}</span>
                  </div>
                   {aiScore !== undefined && (
                    <div className="flex items-center text-blue-600">
                      <span className="emoji mr-2" aria-hidden="true">🤖</span>
                      Punteggio AI: {aiScore}/3
                    </div>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-green-100 p-4 rounded-xl text-center text-green-700 text-lg">
          Perfetto! Hai risposto correttamente a tutte le domande! <span className="emoji" aria-hidden="true">🎉</span>
        </div>
      )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={backToSetup}
            className="flex items-center justify-center p-4 space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors"
          >
            <FilePlus className="w-5 h-5" />
            <span className="font-semibold">Nuovo Quiz</span>
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center p-4 space-x-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-semibold">Scarica Report CSV</span>
          </button>
        </div>

    </div>
  );
};

export default CompletedScreen;
