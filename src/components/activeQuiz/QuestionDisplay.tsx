// components/activeQuiz/QuestionDisplay.tsx
import React from 'react';

type QuestionDisplayProps = {
  question: string;
};

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question }) => {
  return (
    <div className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 leading-tight">
      {question}
    </div>
  );
};
