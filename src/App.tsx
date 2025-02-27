import React, { useRef } from 'react';
import { QuizProvider } from './quizProvider.tsx';
import { QuizLayout } from './quizLayout.tsx';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  return (
    <QuizProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">Quiz App</h1>
        <QuizLayout fileInputRef={fileInputRef} pdfInputRef={pdfInputRef} />
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
          />
           <input
            type="file"
            ref={pdfInputRef}
            style={{ display: 'none' }}
            accept=".pdf"
          />
      </div>
    </QuizProvider>
  );
}

export default App;
