import React, { useEffect } from "react";
import QuizLoader from "./setup/QuizLoader.tsx";
import { useAlert } from "./hooks/useAlert.ts";

function App() {
  const { showAlert, alertMessage, showTemporaryAlert } = useAlert();

  useEffect(() => {
    console.log("App rendered.");
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg min-h-screen relative">
      {showAlert && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white p-3 rounded">
          {alertMessage}
        </div>
      )}

      <QuizLoader showTemporaryAlert={showTemporaryAlert} />
    </div>
  );
}

export default App;
