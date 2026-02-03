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
  type: string;
  category: string;
  options: OptionDetailTypes[];
}

export interface OptionDetailTypes {
    id: string;
    label: string;
    score: number
}