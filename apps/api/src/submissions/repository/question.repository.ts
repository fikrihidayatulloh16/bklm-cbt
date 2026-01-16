import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class QuestionRepository {
    constructor(private prisma: PrismaService) {}

    async totalAnswered(assessment_id){
        return await this.prisma.question.count({
            where: { assessment_id: assessment_id }
        }) 
    }
}