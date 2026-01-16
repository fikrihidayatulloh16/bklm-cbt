import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const QuestionBank = createParamDecorator (
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        const questionBank = request.questionBank;

        return data ? questionBank?.[data] : questionBank
    }
)

