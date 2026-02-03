// components/question-bank/QuestionCard.tsx
import { Card, CardBody, Chip } from "@nextui-org/react";
import { QuestionDetailType } from "../types/question-bank.types"; // Sesuaikan path

interface QuestionCardProps {
  question: QuestionDetailType;
  index: number;
}

export const QuestionCard = ({ question, index }: QuestionCardProps) => {
  return (
    <Card className="border border-default-200" shadow="sm">
      <CardBody className="gap-3">
        {/* Header Soal */}
        <div className="flex justify-between items-start">
          <div className="flex gap-2 items-center">
            <Chip size="sm" color="primary" variant="flat">No. {index + 1}</Chip>
            <Chip size="sm" variant="bordered">{question.type}</Chip>
            <span className="text-xs font-bold text-default-400 uppercase tracking-wider">
              {question.category}
            </span>
          </div>
        </div>

        {/* Teks Soal */}
        <div className="text-lg font-medium text-default-800 pl-1">
          {question.text}
        </div>

        {/* Logic Opsi Jawaban vs Esai */}
        {question.options && question.options.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border text-sm flex justify-between items-center ${
                  opt.score > 0
                    ? "bg-success-50 border-success-200 text-success-800 font-medium"
                    : "bg-default-50 border-default-100 text-default-600"
                }`}
              >
                <span>{opt.label}</span>
                {opt.score > 0 && (
                  <span className="text-xs bg-white px-2 py-1 rounded border border-success-200">
                    Poin: {opt.score}
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-default-50 text-default-400 text-sm italic rounded-lg">
            Soal Esai (Tidak ada opsi jawaban)
          </div>
        )}
      </CardBody>
    </Card>
  );
};