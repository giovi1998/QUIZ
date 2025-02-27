import { Question } from '../components/types';

// Define action types
type Action =
    | { type: 'SET_QUIZ_NAME'; payload: string }
    | { type: 'SET_QUIZ_MODE'; payload: 'default' | 'custom' }
    | { type: 'SET_QUIZ_STATUS'; payload: 'setup' | 'active' | 'completed' | 'empty' }
    | { type: 'SET_TIMER_ENABLED'; payload: boolean }
    | { type: 'SET_TIMER_DURATION'; payload: number }
    | { type: 'SET_QUESTIONS'; payload: Question[] }
    | { type: 'SET_CURRENT_QUESTION_INDEX'; payload: number }
    | { type: 'SET_SELECTED_ANSWER'; payload: string | null }
    | { type: 'SET_SCORE'; payload: number }
    | { type: 'SET_ANSWERS'; payload: (string | null)[] }
    | { type: 'SET_TIMER_ACTIVE'; payload: boolean }
    | { type: 'SET_TIME_REMAINING'; payload: number }
    | { type: 'SET_SHOW_EXPLANATION'; payload: boolean }
    | { type: 'SET_SHOW_FORMAT_INFO'; payload: boolean }
    | { type: 'RESET_QUIZ' };

// Create the reducer function
const quizReducer = (state: any, action: Action) => {
    console.log("Reducer action type:", action.type);
    if (action.type !== 'RESET_QUIZ') {
        console.log("Action payload:", action.payload);
    }

    switch (action.type) {
        case 'SET_QUIZ_NAME':
            return { ...state, quizName: action.payload };
        case 'SET_QUIZ_MODE':
            return { ...state, quizMode: action.payload };
        case 'SET_QUIZ_STATUS':
            return { ...state, quizStatus: action.payload };
        case 'SET_TIMER_ENABLED':
            return { ...state, timerEnabled: action.payload };
        case 'SET_TIMER_DURATION':
            return { ...state, timerDuration: action.payload };
        case 'SET_QUESTIONS':
            return { ...state, questions: action.payload };
        case 'SET_CURRENT_QUESTION_INDEX':
            console.log("Current question index before action:", state.currentQuestionIndex);
            const newState = { ...state, currentQuestionIndex: action.payload };
            console.log("New state after SET_CURRENT_QUESTION_INDEX:", newState);
            return newState;
        case 'SET_SELECTED_ANSWER':
            return { ...state, selectedAnswer: action.payload };
        case 'SET_SCORE':
            return { ...state, score: action.payload };
        case 'SET_ANSWERS':
            return { ...state, answers: action.payload };
        case 'SET_TIMER_ACTIVE':
            return { ...state, timerActive: action.payload };
        case 'SET_TIME_REMAINING':
            return { ...state, timeRemaining: action.payload };
        case 'SET_SHOW_EXPLANATION':
            return { ...state, showExplanation: action.payload };
        case 'SET_SHOW_FORMAT_INFO':
            return { ...state, showFormatInfo: action.payload };
        case 'RESET_QUIZ':
            console.log("Resetting quiz state.");
            const resetState = {
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
            console.log("New state after RESET_QUIZ:", resetState);
            return resetState;
        default:
            return state;
    }
};

export default quizReducer;
