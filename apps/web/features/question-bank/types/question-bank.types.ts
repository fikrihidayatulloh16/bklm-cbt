//apps/web/features/question-bank/types/question-bank.types.ts
export interface QuestionBankListType {
    id: string;
    title: string;
    description: string;
    shared:      Boolean   
    created_at:  String 
    updated_at:  String 
    deleted_at:  String
    author_id:   String
    author: { name: string}
    _count: {
        questions: number;
        select: { questions: true }
    }
}

export interface QuestionBankDetailType {
    id: string;
    title: string;
    description: string;
    shared:      Boolean   
    created_at:  String 
    updated_at:  String 
    deleted_at:  String
    author_id:   String
    author: { name: string}
    questions: QuestionDetailType[];
}

export interface QuestionDetailType {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "YES_NO" | "ESSAY";
  category: string;
  options: OptionDetailTypes[];
}

export interface OptionDetailTypes {
    id: string;
    label: string;
    score: number
}

export interface CreateQuestionBankPayload {
  title: string;          
  description?: string;   
  questions: {           
     text: string;
     type: "MULTIPLE_CHOICE" | "YES_NO" | "ESSAY" | "SCale";
     category: string;
     options?: { label: string; score: number }[];
  }[]; 
}

