// components/completedQuiz/QuizResult.tsx
import React, { useEffect } from 'react';
import { Report } from '../types.ts';


type QuizResultProps = {
    report: Report;
};

export const QuizResult: React.FC<QuizResultProps> = ({ report }) => {
  useEffect(() => {
    if (report.totalQuestions > 0) {
      console.log("Quiz results displayed:", report.correctAnswers, "/", report.totalQuestions);
      console.log("Performance percentage:", report.percentage);
    }
  }, [report]);


  const getPerformanceMessage = (percentage: number): string => {

        if (percentage >= 90) return "Eccellente!";
        if (percentage >= 70) return "Ottimo!";
        if (percentage >= 50) return "Buono";
        return "Da migliorare";
    };

    const getPerformanceColor = (percentage: number): string => {
        return percentage >= 70 ? 'green' : 'red';
    };

    return (
        <div className="bg-gray-50 p-4 md:p-6 rounded-lg text-center space-y-3 md:space-y-4">
            <div className="flex items-center justify-center space-x-2">
                <span className="text-xl md:text-2xl font-semibold">
                    {report.correctAnswers}/{report.totalQuestions}
                </span>
                <span
                    className={`text-sm font-bold px-2 py-1 rounded bg-${getPerformanceColor(
                        report.percentage
                    )}-100 text-${getPerformanceColor(report.percentage)}-600`}
                >
                    {getPerformanceMessage(report.percentage)}
                </span>
            </div>
            <div className="text-4xl md:text-5xl font-black text-blue-600">
                {report.percentage}%
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-2 bg-${getPerformanceColor(
                        report.percentage
                    )}-500 rounded-full`}
                    style={{ width: `${report.percentage}%` }}
                />
            </div>
        </div>
    );
};
