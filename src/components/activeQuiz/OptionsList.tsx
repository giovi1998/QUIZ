// components/activeQuiz/OptionsList.tsx
import React from 'react';
import { OptionItem } from './OptionItem.tsx';

type OptionsListProps = {
  shuffledOptions: string[];
  selectedAnswer: string | null;
  setSelectedAnswer: (answer: string | null) => void;
  showExplanation: boolean;
};

export const OptionsList: React.FC<OptionsListProps> = ({
  shuffledOptions,
  selectedAnswer,
  setSelectedAnswer,
  showExplanation,
}) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {shuffledOptions.map((option, idx) => (
        <OptionItem
          key={idx}
          option={option}
          selected={selectedAnswer === option}
          onSelect={() => {
            if (!showExplanation) {
              setSelectedAnswer(option);
            }
          }}
        />
      ))}
    </div>
  );
};
