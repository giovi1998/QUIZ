// useAlert.ts
/**
 * useAlert Hook
 *
 * Questo hook personalizzato gestisce la visualizzazione di messaggi di avviso temporanei.
 * Fornisce lo stato per mostrare o nascondere l'avviso e il messaggio da visualizzare.
 *
 * @returns {object} Un oggetto con lo stato dell'avviso, il messaggio e la funzione per mostrare l'avviso.
 * @property {boolean} showAlert - Indica se l'avviso deve essere mostrato.
 * @property {string} alertMessage - Il messaggio da visualizzare nell'avviso.
 * @property {function} showTemporaryAlert - Funzione per mostrare un avviso temporaneo.
 *
 * Usage:
 * Questo hook viene utilizzato in QuizLoader e QuizManager per mostrare messaggi temporanei all'utente.
 * Ad esempio, quando un file viene caricato correttamente o quando si verifica un errore.
 */
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
