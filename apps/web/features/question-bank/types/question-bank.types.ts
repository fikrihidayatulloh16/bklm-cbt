export interface QuestionBankListType {
    id: string;
    title: string;
    description: string;
    shared:      Boolean   
    created_at:  String 
    updated_at:  String 
    deleted_at:  String
    author_id:   String
    questions: QuestionDetail[];
}

interface QuestionDetail {
  id: string;
  text: string;
  type: string;
  category: string;
  options: OptionDetail[];
}

interface OptionDetail {
    id: string;
    label: string;
    score: number
}