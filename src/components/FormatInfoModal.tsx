// components/FormatInfoModal.tsx
import React from "react";
import { X } from "lucide-react";

// Tipo delle props per il componente FormatInfoModal
type FormatInfoModalProps = {
  onClose: () => void; // Funzione per chiudere il modal
};

// Componente per visualizzare le informazioni sul formato JSON richiesto
export const FormatInfoModal: React.FC<FormatInfoModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* Contenitore principale del modal */}
      <div className="modal-container bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        {/* Header con pulsante di chiusura */}
        <div className="flex justify-end">
          <X
            size={24}
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition"
            onClick={onClose}
          />
        </div>

        {/* Contenuto informativo */}
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Formato file JSON richiesto
        </h2>

        <div className="space-y-6">
          {/* Descrizione struttura base */}
          <p className="text-gray-600">
            Il file deve essere in formato JSON e contenere un array di oggetti.
            Ogni oggetto (domanda) deve avere:
          </p>

          {/* Lista dei campi obbligatori */}
          <ul className="list-disc pl-6 text-gray-600">
            <li>
              <strong>question:</strong> Testo della domanda (stringa)
            </li>
            <li>
              <strong>options:</strong> Array di opzioni di risposta (string[])
            </li>
            <li>
              <strong>correctAnswer:</strong> Risposta corretta (stringa)
            </li>
            <li>
              <strong>explanation:</strong> Spiegazione della risposta (stringa)
            </li>
          </ul>

          {/* Esempio di JSON corretto */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {`[
  {
    "question": "A quanto risale l'utilizzo delle prime immagini digitali?",
    "options": ["Anni '20", "Anni '40", "Anni '30", "Anni '10"],
    "correctAnswer": "Anni '40",
    "explanation": "Le prime immagini digitali sono state utilizzate negli anni '40, principalmente in ambito scientifico e militare, prima dello sviluppo dei computer moderni."
  },
  {
    "question": "Quando è stato introdotto per la prima volta il concetto di Computer Vision?",
    "options": ["Nel 1966 presso il Massachusetts Institute of Technology (MIT)", "Nel 1990 grazie all'Intelligenza Artificiale", "Da David Marr nel 1982", "Negli Anni '90 dalla Berkely University"],
    "correctAnswer": "Nel 1966 presso il Massachusetts Institute of Technology (MIT)",
    "explanation": "Il concetto di Computer Vision è stato formalizzato nel 1966 al MIT con un progetto pionieristico che mirava a far 'vedere' i computer."
  }
]`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
