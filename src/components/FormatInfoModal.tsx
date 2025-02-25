// components/FormatInfoModal.tsx
import React from "react";
import { X } from "lucide-react";

type FormatInfoModalProps = {
  onClose: () => void;
};

export const FormatInfoModal: React.FC<FormatInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      <div className="modal-container bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto mt-20">
        {/* Bottone Chiudi */}
        <div className="flex justify-end">
          <X
            size={24}
            className="cursor-pointer text-gray-500 hover:text-gray-700 transition"
            onClick={onClose}
          />
        </div>

        {/* Contenuto del modal */}
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Formato file JSON richiesto
        </h2>

        <div className="space-y-6">
          <p className="text-gray-600">
            Il file deve essere in formato JSON e contenere un array di oggetti.
            Ogni oggetto (domanda) deve avere:
          </p>

          <ul className="list-disc pl-6 text-gray-600">
            <li><strong>question:</strong> Testo della domanda (stringa)</li>
            <li><strong>options:</strong> Array di opzioni di risposta (string[])</li>
            <li><strong>correctAnswer:</strong> Risposta corretta (stringa)</li>
            <li><strong>explanation:</strong> Spiegazione della risposta (stringa)</li>
          </ul>

          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {`[
  {
    "question": "A quanto risale l'utilizzo delle prime immagini digitali?",
    "options": ["Anni '20", "Anni '40", "Anni '30", "Anni '10"],
    "correctAnswer": "Anni '40",
    "explanation": "L'utilizzo delle prime immagini digitali risale agli anni '40."
  }
]`}
            </pre>
          </div>

          <p className="text-gray-600">
            Se hai domande formattate in questo modo:
          </p>
          <div className="bg-yellow-100 p-4 rounded-lg">
            Domanda 2: A quanto risale l'utilizzo delle prime immagini digitali?
            <br />
            ◦ Anni '20
            <br />
            ◦ Anni '40
            <br />
            ◦ Anni '30
            <br />
            ◦ Anni '10
            <br />
            Risposta corretta: Anni '40
          </div>

          <p className="text-gray-600">
            Puoi usare questo prompt per trasformare il testo nel formato JSON
            richiesto:
          </p>
          <div className="bg-green-100 p-4 rounded-lg">
            Trasforma il seguente testo in un oggetto JSON con le proprietà{" "}
            <code className="text-blue-500">question</code>,{" "}
            <code className="text-blue-500">options</code>,{" "}
            <code className="text-blue-500">correctAnswer</code>,{" "}
            <code className="text-blue-500">explanation</code>:
            <br />
            "Domanda 2: A quanto risale l'utilizzo delle prime immagini digitali?"
            <br />
            ◦ Anni '20
            <br />
            ◦ Anni '40
            <br />
            ◦ Anni '30
            <br />
            ◦ Anni '10
            <br />
            Risposta corretta: Anni '40
          </div>

          {/* Bottone Chiudi */}
          <div className="flex justify-center mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            >
              Chiudi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};