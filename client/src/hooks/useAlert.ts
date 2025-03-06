// hooks/useAlert.ts
import { useState, useCallback } from "react";

export const useAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const showTemporaryAlert = useCallback((message: string) => {
    console.log("✅ Nuovo alert mostrato: " + message);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => {
      setShowAlert(false);
      console.log("✅ Alert nascosto");
    }, 3000);
  }, []);

  return { showAlert, alertMessage, showTemporaryAlert };
};
