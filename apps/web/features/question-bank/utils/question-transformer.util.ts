import { RawQuestion, GroupedQuestionCategory } from '../types/grouped-question-bank.types';

export const groupQuestionsByCategory = (rawQuestions: RawQuestion[]): GroupedQuestionCategory[] => {
    if (!rawQuestions || rawQuestions.length === 0) return [];

    return rawQuestions.reduce((acc: GroupedQuestionCategory[], question: RawQuestion) => {
        const existingCategory = acc.find(item => item.category === question.category);

        if (existingCategory) {
            existingCategory.questions.push(question);
        } else {
            acc.push({
                category: question.category,
                questions: [question]
            });
        }
        return acc;
    }, []);
};