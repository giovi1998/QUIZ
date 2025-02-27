// utils.ts
import { Report } from "./components/types";

// Funzione per scaricare il report come CSV
export const generateCsv = (quizName: string, report: Report) => {
    // Build header lines
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

    // Add missed questions details
    if (report.missed.length > 0) {
        csvContent += "Domande sbagliate:\n";
        csvContent += "Domanda,Tua risposta,Risposta corretta\n";
        report.missed.forEach((item) => {
            const formattedQuestion = item.question.replace(/"/g, '""');
            const formattedYourAnswer = item.yourAnswer.replace(/"/g, '""');
            const formattedCorrectAnswer = item.correctAnswer.replace(/"/g, '""');
            csvContent += `"${formattedQuestion}","${formattedYourAnswer}","${formattedCorrectAnswer}"\n`;
        });
    }

    // Create and trigger the download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${quizName}_report.csv`);
    link.style.display = "none"; // Hide the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
