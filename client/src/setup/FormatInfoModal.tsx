// components/FormatInfoModal.tsx
import React from 'react';
import { X, FileText, Code } from "lucide-react";
import {FormatInfoModalProps} from '../components/type/Types.tsx'

export const FormatInfoModal: React.FC<FormatInfoModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            Formati Supportati
          </h2>
        </div>

        <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Code className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Formato JSON</h3>
            </div>
            <pre className="p-4 bg-gray-100 rounded-lg text-sm font-mono overflow-x-auto">
              {`[
  {
    "question": "Testo della domanda...",
    "options": ["Opzione 1", "Opzione 2", "Opzione 3", "Opzione 4"],
    "correctAnswer": "Opzione 1",
    "explanation": "Spiegazione dettagliata..."
  }
]`}
            </pre>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-blue-500" />
              <h3 className="text-xl font-semibold">Formato PDF</h3>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg text-sm font-mono">
              1. Qual è il componente principale di una CNN?<br/>
              A) Fully Connected Layer<br/>
              B) Convolutional Layer ✔️<br/><br/>
              Spiegazione: Il livello convoluzionale è fondamentale per...
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};