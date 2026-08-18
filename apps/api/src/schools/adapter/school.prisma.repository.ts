// apps/api/src/schools/adapter/school.prisma.repository.ts
import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Prisma, PrismaClient } from "@prisma/client";
import { connect } from "http2";
import { ISchoolRepository } from "../ports/school.repository.interface";
import { SchoolDomain, SchoolSubscription } from "../entities/school.entity";

@Injectable()
export class SchoolRepository implements ISchoolRepository {
    constructor(private readonly prisma: PrismaService) {}

    async createSchool(school: SchoolDomain): Promise<SchoolDomain> {
        const createSchoolPrisma = await this.prisma.school.create({
            data: {
                name: school.name,
                // subscription: school.subscription,
            }
        })

        const mappedDomain = SchoolDomain.reconstitute(
            createSchoolPrisma.id,
            createSchoolPrisma.name,
            createSchoolPrisma.subscription as SchoolSubscription,
        )

        return mappedDomain
    }

    async findAllSchool(): Promise<SchoolDomain[]> {
        const listedSchool = await this.prisma.school.findMany({  
        })

        const mappedDomains = listedSchool.map((prismaSchool) => {
            return SchoolDomain.reconstitute(
                prismaSchool.id,
                prismaSchool.name,
                prismaSchool.subscription as SchoolSubscription // Casting ke enum domain
            );
        });

        return mappedDomains;
    }

    async findDetailSchoolBySchoolId(Schoold: string): Promise<SchoolDomain | null> {
        const detailedSchool = await this.prisma.school.findUnique({
            where: {id: Schoold}
        })

        if (!detailedSchool) {
        return null; 
        }

        return SchoolDomain.reconstitute(
            detailedSchool.id,
            detailedSchool.name,
            detailedSchool.subscription as SchoolSubscription
        );
    }   
}

