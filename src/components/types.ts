// components/types.ts
export type Question = {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    lecture?: string;
    type?: 'multiple-choice' | 'open';
};
// Type for the missed questions
export type Missed = {
    question: string;
    yourAnswer: string;
    correctAnswer: string;
};
export type Report = {
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    missed: Missed[];
};
// Function to shuffle an array (Fisher-Yates shuffle) <T>
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}
