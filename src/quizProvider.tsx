import React, { createContext, useContext, useReducer } from 'react';
import quizReducer from './reducers/quizReducer.ts';
import { Question } from './components/types.ts';

// Define the state type for better type safety
export type QuizState = {
    quizName: string;
    quizMode: "default" | "custom";
    quizStatus: QuizStatus;
    timerEnabled: boolean;
    timerDuration: number;
    questions: Question[];
    currentQuestionIndex: number;
    selectedAnswer: string | null;
    score: number;
    answers: (string | null)[];
    timerActive: boolean;
    timeRemaining: number;
    showExplanation: boolean;
    showFormatInfo: boolean;
};
// Define the initial state
export const initialState: QuizState = {
    quizName: "",
    quizMode: "default",
    quizStatus: "setup",
    timerEnabled: false,
    timerDuration: 10,
    questions: [],
    currentQuestionIndex: 0,
    selectedAnswer: null,
    score: 0,
    answers: [],
    timerActive: false,
    timeRemaining: 0,
    showExplanation: false,
    showFormatInfo: false,
};

// Create the context
interface QuizContextProps {
    state: QuizState;
    dispatch: React.Dispatch<any>;
}

const QuizContext = createContext<QuizContextProps>({
    state: initialState,
    dispatch: () => null
});

// Create a custom hook to use the context
export const useQuiz = () => useContext(QuizContext);

interface QuizProviderProps {
    children: React.ReactNode;
}

// Create the provider component
export const QuizProvider: React.FC<QuizProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(quizReducer, initialState);

    return (
        <QuizContext.Provider value={{ state, dispatch }}>
            {children}
        </QuizContext.Provider>
    );
};
export type QuizStatus = "setup" | "active" | "completed" | "empty";
