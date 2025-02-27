// components/QuestionInfo.tsx
import React, { useEffect } from "react";

type QuestionInfoProps = {
  currentQuestionIndex: number;
  totalQuestions: number;
  score: number;
};

const QuestionInfo: React.FC<QuestionInfoProps> = ({


  currentQuestionIndex,
  totalQuestions,
  score,
}) => {
  useEffect(() => {
    console.log("Current question index:", currentQuestionIndex);
    console.log("Current score:", score);
  }, [currentQuestionIndex, score]);

  return (  

    <div className="flex justify-between items-center">
      <div>
        <span className="text-gray-600 font-medium">
          Domanda {currentQuestionIndex + 1} di {totalQuestions}
        </span>
      </div>
      <div className="text-green-600 font-medium">
        Punteggio: {score}
      </div>
    </div>
  );
};

export default QuestionInfo;
