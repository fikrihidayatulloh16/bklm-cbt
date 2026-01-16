import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const User = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        // Jika dipanggil @User(), kembalikan satu objek user utuh
        // Jika dipanggil @User('id'), kembalikan hanya properti id
        return data ? user?.[data] : user;
    }
)