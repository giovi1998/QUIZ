import React, { useRef, useState, useEffect } from 'react';
import { useQuiz } from './quizProvider.tsx';
import { SetupScreen } from './components/setupQuiz/SetupScreen.tsx';
import { EmptyScreen } from './components/EmptyScreen.tsx';
import ActiveQuizScreen from './components/activeQuiz/ActiveQuizScreen.tsx';
import { CompletedScreen } from './components/completedQuiz/CompletedScreen.tsx';
import { FormatInfoModal } from './components/FormatInfoModal.tsx';
import { generatePdf } from './generatePdf.ts';
import { QuestionFromPdf, extractFromPdf } from './pdfExtractor.tsx';
import { Question, shuffleArray } from './components/types.ts';
import { Alert } from './components/Alert.tsx';

// Import default questions for default mode. You should create this file with a default array of questions
import defaultQuestions from './data/defaultQuestions.json';

interface QuizLayoutProps {
    fileInputRef: React.RefObject<HTMLInputElement>;
    pdfInputRef: React.RefObject<HTMLInputElement>;
}

// Function to select a random subset of questions
function selectRandomQuestions(questions: Question[], count: number): Question[] {
    const shuffledQuestions = shuffleArray(questions);
    return shuffledQuestions.slice(0, count);
}

export const QuizLayout: React.FC<QuizLayoutProps> = ({ fileInputRef, pdfInputRef }) => {
    const { state, dispatch } = useQuiz();
    const { quizName, quizMode, quizStatus, timerEnabled, timerDuration, questions, currentQuestionIndex, selectedAnswer, score, answers, timerActive, timeRemaining, showExplanation, showFormatInfo } = state;
    const [alertMessage, setAlertMessage] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const [quizQuestions, setQuizQuestions] = useState<Question[]>([]); // Add state for quiz questions
    const QUIZ_SIZE = 5;

    // Use useEffect to update quizQuestions when questions change
    useEffect(() => {
        if (quizStatus === "active") {
            if (questions.length >= QUIZ_SIZE) {
                const selectedQuestions = selectRandomQuestions(questions, QUIZ_SIZE);
                setQuizQuestions(selectedQuestions);
            } else {
                setQuizQuestions([...questions]);
            }
        } else {
            setQuizQuestions([]);
        }
    }, [questions, quizStatus]);

    // **Handle State Changes After Quiz Completion**
    useEffect(() => {
        if (quizStatus === "completed") {
            // Commented out the reset logic
            // if (quizQuestions.length !== 5 || (answers?.length || 0) !== 5) {
            //     dispatch({ type: "SET_QUIZ_STATUS", payload: "setup" });
            //     dispatch({ type: 'SET_QUESTIONS', payload: [] });
            //     dispatch({ type: 'SET_ANSWERS', payload: [] });
            // }
        }
    }, [quizStatus, quizQuestions, answers, dispatch]);


    // Pure Function to Calculate Report Data
    const reportData = (): any => {
        if (!quizQuestions || !Array.isArray(quizQuestions) || quizQuestions.length === 0 || !answers || !Array.isArray(answers)) {
            return { totalQuestions: 0, correctAnswers: 0, percentage: 0, missed: [] };
        }

        const totalQuestions = quizQuestions.length;
        const correctAnswers = score;
        const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        const missed = quizQuestions.reduce((acc, q, idx) => {
            const yourAnswer = answers[idx] || "Nessuna risposta";
            if (yourAnswer !== q.correctAnswer) {
                acc.push({
                    question: q.question,
                    yourAnswer: yourAnswer,
                    correctAnswer: q.correctAnswer,
                });
            }
            return acc;
        }, []);
        return { totalQuestions, correctAnswers, percentage, missed };
    };

    // Gestione del caricamento del file JSON (domande personalizzate)
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const content = event.target?.result as string;
                let parsedData: Question[] = JSON.parse(content);
                if (!Array.isArray(parsedData)) {
                    throw new Error("Formato JSON non valido: deve essere un array");
                }
                parsedData.forEach((q, i) => {
                    if (!q.question || !Array.isArray(q.options) || !q.correctAnswer || !q.explanation) {
                        throw new Error(`Domanda ${i + 1} manca dei campi obbligatori`);
                    }
                    if (!q.options.includes(q.correctAnswer)) {
                        throw new Error(`Domanda ${i + 1}: la risposta corretta non è presente tra le opzioni`);
                    }
                });
                dispatch({ type: "SET_QUESTIONS", payload: parsedData });
                dispatch({ type: "RESET_QUIZ" }); // Reset only after setting questions
                startDefaultQuiz(); // Start the quiz after loading questions

                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                if (fileInputRef.current) fileInputRef.current.value = "";
            } catch (error) {
                console.error("Errore di caricamento:", error);
                setAlertMessage(`Errore: ${(error as Error).message}`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
                if (fileInputRef.current) fileInputRef.current.value = "";
            }
        };
        reader.readAsText(file);
    };

    // Gestione del caricamento del file PDF usando extractFromPdf
    const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const extractedQuestions: QuestionFromPdf[] = await extractFromPdf(file);

            const processedQuestions: Question[] = extractedQuestions.map((q) => ({
                question: q.question,
                options: q.options || [],
                correctAnswer: q.correctAnswer || "",
                explanation: q.explanation || "",
                lecture: q.lecture || "",
                type: q.type || "multiple-choice"
            }));
            if (processedQuestions.length > 0) {
                if (processedQuestions.length === 27) {
                    const hasAllExplanation = processedQuestions.every((q) => q.explanation != "");
                    if (hasAllExplanation) {
                        dispatch({ type: 'SET_QUESTIONS', payload: processedQuestions });
                        dispatch({ type: 'SET_QUIZ_STATUS', payload: 'active' });
                        setAlertMessage(`Caricate ${processedQuestions.length} domande da PDF con successo!`);
                        setShowAlert(true);
                        setTimeout(() => setShowAlert(false), 3000);
                    } else {
                        dispatch({ type: "SET_QUIZ_STATUS", payload: "setup" })
                        setAlertMessage("Non tutte le 27 domande hanno la spiegazione");
                        setShowAlert(true);
                        setTimeout(() => setShowAlert(false), 3000);
                    }
                }
                else {
                    dispatch({ type: 'SET_QUESTIONS', payload: processedQuestions });
                    dispatch({ type: 'SET_QUIZ_STATUS', payload: 'active' });
                    setAlertMessage(`Caricate ${processedQuestions.length} domande da PDF con successo!`);
                    setShowAlert(true);
                    setTimeout(() => setShowAlert(false), 3000);
                }
            } else {
                dispatch({ type: 'SET_QUIZ_STATUS', payload: 'empty' });
                setAlertMessage(`Nessuna domanda a scelta multipla trovata nel PDF.`);
                setShowAlert(true);
                setTimeout(() => setShowAlert(false), 3000);
            }
            if (pdfInputRef.current) pdfInputRef.current.value = "";
        } catch (error) {
            console.error("Errore di caricamento PDF:", error);
            setAlertMessage(`Errore: ${(error as Error).message}`);
            setShowAlert(true);
            setTimeout(() => setShowAlert(false), 3000);
            if (pdfInputRef.current) pdfInputRef.current.value = "";
        }
    };

    // New function for generating PDF
    const handleGeneratePdf = () => {
        generatePdf(quizQuestions);
    };

    // Corrected function to start the quiz in "default" mode
const startDefaultQuiz = () => {
console.log("Starting default quiz. Setting current question index to 1.");

    if (quizMode === "default") {
        dispatch({ type: "SET_QUESTIONS", payload: defaultQuestions });
    }
    dispatch({ type: "SET_CURRENT_QUESTION_INDEX", payload: 0 }); // Reset current question index

                dispatch({ type: "SET_QUIZ_STATUS", payload: "active" });


};

    return (
        <>
            {showAlert && (
                <Alert message={alertMessage} showAlert={showAlert} />
            )}
            {quizStatus === "setup" && (
                <SetupScreen
                    quizName={quizName}
                    setQuizName={(name: string) => dispatch({ type: "SET_QUIZ_NAME", payload: name })}
                    quizMode={quizMode}
                    setQuizMode={(mode: "default" | "custom") => dispatch({ type: "SET_QUIZ_MODE", payload: mode })}
                    timerEnabled={timerEnabled}
                    setTimerEnabled={(timerEnabled: boolean) => dispatch({ type: "SET_TIMER_ENABLED", payload: timerEnabled })}
                    timerDuration={timerDuration}
                    setTimerDuration={(timerDuration: number) => dispatch({ type: "SET_TIMER_DURATION", payload: timerDuration })}
                    questions={questions}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    onSetupComplete={startDefaultQuiz}
                    showFormatInfo={showFormatInfo}
                    setShowFormatInfo={(show: boolean) => dispatch({ type: "SET_SHOW_FORMAT_INFO", payload: show })}
                    pdfInputRef={pdfInputRef}
                    handlePdfUpload={handlePdfUpload}
                />
            )}

            {quizStatus === "empty" && (
                <EmptyScreen
                    quizName={quizName}
                    fileInputRef={fileInputRef}
                    handleFileUpload={handleFileUpload}
                    setQuizStatus={(status: "setup" | "active" | "completed" | "empty") => dispatch({ type: "SET_QUIZ_STATUS", payload: status })}
                    setShowFormatInfo={(show: boolean) => dispatch({ type: "SET_SHOW_FORMAT_INFO", payload: show })}
                    backToSetup={() => {
                        dispatch({ type: 'SET_QUESTIONS', payload: [] });
                        dispatch({ type: 'SET_ANSWERS', payload: [] });
                        dispatch({ type: 'SET_QUIZ_STATUS', payload: 'setup' });
                    }}
                />
            )}

            {quizStatus === "active" && quizQuestions.length > 0 && (
                <ActiveQuizScreen
                    quizName={quizName}
                    currentQuestionIndex={currentQuestionIndex}
                    totalQuestions={quizQuestions.length}
                    score={score}
                    question={quizQuestions[currentQuestionIndex]}
                    selectedAnswer={selectedAnswer}
                    setSelectedAnswer={(answer: string | null) => dispatch({ type: "SET_SELECTED_ANSWER", payload: answer })}
                    showExplanation={showExplanation}
                    handleAnswer={(answer: string | null) => {
                        dispatch({ type: 'SET_TIMER_ACTIVE', payload: false });
                        const current = quizQuestions[currentQuestionIndex];
                        if (current && answer === current.correctAnswer) {
                            dispatch({ type: 'SET_SCORE', payload: score + 1 });
                        }
                        dispatch({ type: 'SET_ANSWERS', payload: [...answers, answer] });
                        dispatch({ type: 'SET_SELECTED_ANSWER', payload: answer });
                        dispatch({ type: 'SET_SHOW_EXPLANATION', payload: true });
                    }}
                    nextQuestion={() => {
                        console.log("Navigating to the next question. Current index:", currentQuestionIndex, "Total questions:", quizQuestions.length);
                        console.log("Navigating to the next question. Current index:", currentQuestionIndex, "Total questions:", quizQuestions.length);

                        const nextIndex = currentQuestionIndex + 1;
                        if (nextIndex < quizQuestions.length) {
                            dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: nextIndex });
                        } else {
                            dispatch({ type: 'SET_QUIZ_STATUS', payload: 'completed' });
                        }


                    }}
                    timeRemaining={timeRemaining}
                    timerActive={timerActive}
                    timerEnabled={timerEnabled}
                    setCurrentQuestionIndex={(current) => dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', payload: current })} 
                    setQuizStatus={(status: "setup" | "active" | "completed" | "empty") => dispatch({ type: "SET_QUIZ_STATUS", payload: status })}
                    dispatch={dispatch}
                    timerDuration={timerDuration}
                />
            )}

            {quizStatus === "completed" && (
                <CompletedScreen
                    quizName={quizName}
                    report={reportData()}                    resetQuiz={() => {
                        dispatch({ type: 'RESET_QUIZ' });
                        dispatch({ type: 'SET_QUIZ_STATUS', payload: 'active' });
                    }}
                    backToSetup={() => {
                        dispatch({ type: 'SET_QUESTIONS', payload: [] });
                        dispatch({ type: 'SET_ANSWERS', payload: [] });
                        dispatch({ type: 'SET_QUIZ_STATUS', payload: 'setup' });
                    }}
                />
            )}

            {quizQuestions.length > 0 && (
                <button
                    onClick={handleGeneratePdf}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
                >
                    Genera PDF Domande
                </button>
            )}

            {showFormatInfo && (
                <FormatInfoModal onClose={() => dispatch({ type: "SET_SHOW_FORMAT_INFO", payload: false })} />
            )}
        </>
    );
};
