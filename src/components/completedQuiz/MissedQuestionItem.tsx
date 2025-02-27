// components/completedQuiz/MissedQuestionItem.tsx
import React from 'react';
import { Missed } from '../types.ts';

type MissedQuestionItemProps = {
  item: Missed;
};

export const MissedQuestionItem: React.FC<MissedQuestionItemProps> = ({ item }) => {
  return (
    <div className="p-3 md:p-4 bg-gray-50 rounded-lg shadow-sm space-y-2 mb-3">
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
  );
};
