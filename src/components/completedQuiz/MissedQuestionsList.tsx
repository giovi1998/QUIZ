// components/completedQuiz/MissedQuestionsList.tsx
import React from 'react';
import { MissedQuestionItem } from './MissedQuestionItem.tsx';
import { Missed } from '../types.ts';

type MissedQuestionsListProps = {
  missed: Missed[];
};

export const MissedQuestionsList: React.FC<MissedQuestionsListProps> = ({ missed }) => {
  if (missed.length === 0) {
    return null; // Don't render anything if there are no missed questions
  }
  return (
    <div className="space-y-3 md:space-y-4">
      <h2 className="text-xl md:text-2xl font-bold text-center mb-2 md:mb-4">
        Domande sbagliate ({missed.length})
      </h2>
      <div className="max-h-60 md:max-h-80 overflow-y-auto pr-2">
        {missed.map((item, idx) => (
          <MissedQuestionItem key={idx} item={item} />
        ))}
      </div>
    </div>
  );
};
