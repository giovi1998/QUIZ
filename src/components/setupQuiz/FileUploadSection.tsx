import React, { useEffect } from 'react';
import { Upload, FileText, Info } from "lucide-react";

type FileUploadSectionProps = {
    questions: any[];
    fileInputRef: React.RefObject<HTMLInputElement>;
    pdfInputRef: React.RefObject<HTMLInputElement>;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setShowFormatInfo: (show: boolean) => void;
};

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({ questions, fileInputRef, pdfInputRef, handleFileUpload, handlePdfUpload, setShowFormatInfo }) => {
    return (
        <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700 mb-3">Carica le tue domande</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Upload file JSON */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                    <label htmlFor="json-upload" className="flex flex-col items-center justify-center cursor-pointer">
                        <Upload size={24} className="text-blue-500 mb-2" />
                        <span className="text-sm text-center text-gray-700 font-medium">
                            Carica file JSON
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                            Formato strutturato
                        </span>
                    </label>
                    <input
                        id="json-upload"
                        type="file"
                        accept=".json"
                        ref={fileInputRef}
                        onChange={(e) => {
                            console.log("JSON file uploaded:", e.target.files[0]?.name);
                            handleFileUpload(e);
                        }}
                        className="hidden"
                    />
                </div>

                {/* Upload file PDF */}
                <div className="bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                    <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center cursor-pointer">
                        <FileText size={24} className="text-blue-500 mb-2" />
                        <span className="text-sm text-center text-gray-700 font-medium">
                            Carica file PDF
                        </span>
                        <span className="text-xs text-gray-500 text-center mt-1">
                            Estrazione automatica
                        </span>
                    </label>
                    <input
                        id="pdf-upload"
                        type="file"
                        accept=".pdf"
                        ref={pdfInputRef}
                        onChange={(e) => {
                            console.log("PDF file uploaded:", e.target.files[0]?.name);
                            handlePdfUpload(e);
                        }}
                        className="hidden"
                    />
                </div>
            </div>

            {questions.length > 0 && (
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
            )}

            <button
                onClick={() => setShowFormatInfo(true)}
                className="flex items-center mt-3 text-blue-500 text-xs hover:underline mx-auto"
            >
                <Info size={14} className="mr-1" />
                Formato file richiesto
            </button>
        </div>
    );
};
