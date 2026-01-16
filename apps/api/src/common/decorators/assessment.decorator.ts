import { createParamDecorator ,ExecutionContext } from "@nestjs/common";

export const Assessment = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const assessment = request.assessment;

        return data ? assessment?.[data] : assessment
    }
)