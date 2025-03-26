// components/FormatInfoModal.tsx
/**
 * FormatInfoModal Component
 *
 * Questo componente visualizza un modale che fornisce informazioni sui formati di file supportati per il caricamento delle domande.
 * Mostra esempi di formati JSON e PDF accettati.
 *
 * Usage:
 * Questo componente è utilizzato in SetupScreen quando l'utente clicca sul pulsante "Formati supportati".
 * Fornisce una guida visiva su come strutturare i file JSON e PDF per il caricamento delle domande.
 */
import React, { useState } from 'react';
import { X, FileText, Code, ChevronDown, ChevronUp } from "lucide-react";
import {FormatInfoModalProps} from '../type/Types.tsx'

export const FormatInfoModal: React.FC<FormatInfoModalProps> = ({ onClose }) => {
  const [jsonExpanded, setJsonExpanded] = useState(false);
  const [pdfExpanded, setPdfExpanded] = useState(false);
  
  const toggleJson = () => setJsonExpanded(!jsonExpanded);
  const togglePdf = () => setPdfExpanded(!pdfExpanded);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-0.5 xs:p-1 sm:p-2 md:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-0.5 xs:mx-1 sm:mx-2 md:mx-4 max-h-[95vh] flex flex-col">
        <div className="flex justify-between items-center p-1.5 xs:p-2 sm:p-3 md:p-6 border-b">
          <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
            Formati Supportati
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Chiudi"
          >
            <X className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-1.5 xs:p-2 sm:p-3 md:p-6 space-y-3 xs:space-y-4 sm:space-y-6 md:space-y-8 overflow-y-auto flex-grow">
          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 xs:gap-1 sm:gap-2 md:gap-3">
                <Code className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold">Formato JSON</h3>
              </div>
              <button 
                onClick={toggleJson} 
                className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={jsonExpanded ? "Comprimi" : "Espandi"}
              >
                {jsonExpanded ? <ChevronUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" />}
              </button>
            </div>
            <pre className={`p-1.5 xs:p-2 sm:p-3 md:p-4 bg-gray-100 rounded-lg text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-mono overflow-x-auto transition-all ${!jsonExpanded && 'max-h-24 xs:max-h-28 md:max-h-none overflow-y-auto md:overflow-y-visible'}`}>
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

          <div className="space-y-2 sm:space-y-3 md:space-y-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-1 xs:gap-1 sm:gap-2 md:gap-3">
                <FileText className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500" />
                <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-semibold">Formato PDF</h3>
              </div>
              <button 
                onClick={togglePdf} 
                className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={pdfExpanded ? "Comprimi" : "Espandi"}
              >
                {pdfExpanded ? <ChevronUp className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-500" />}
              </button>
            </div>
            <div className={`p-1.5 xs:p-2 sm:p-3 md:p-4 bg-gray-100 rounded-lg text-[9px] xs:text-[10px] sm:text-xs md:text-sm font-mono overflow-x-auto transition-all ${!pdfExpanded && 'max-h-24 xs:max-h-28 md:max-h-none overflow-y-auto md:overflow-y-visible'}`}>
              1. Qual è il componente principale di una CNN?<br/>
              A) Fully Connected Layer<br/>
              B) Convolutional Layer ✔️<br/><br/>
              Spiegazione: Il livello convoluzionale è fondamentale per...
            </div>
          </div>
        </div>

        <div className="p-1.5 xs:p-2 sm:p-3 md:p-6 border-t mt-auto">
          <button
            onClick={onClose}
            className="w-full py-1 xs:py-1.5 sm:py-2 md:py-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm md:text-base font-medium rounded-lg transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};