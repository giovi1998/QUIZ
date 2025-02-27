// components/setupQuiz/UploadInfo.tsx
import React, { useEffect } from 'react';


type UploadInfoProps = {
  questions: any[];
};

export const UploadInfo: React.FC<UploadInfoProps> = ({ questions }) => {
  useEffect(() => {
    console.log("Questions uploaded:", questions.length);
  }, [questions]);

  if (!Array.isArray(questions) || questions.length === 0) return null; // Corrected condition


  return (
    <div className="mt-3 bg-green-50 p-2 rounded-lg">
      <span className="flex items-center justify-center text-green-600 text-sm font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        {questions.length} domande caricate con successo
      </span>
    </div>
  );
};
