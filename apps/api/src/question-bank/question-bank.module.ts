import { Module } from '@nestjs/common';
import { QuestionBankService } from './question-bank.service';
import { QuestionBankController } from './question-bank.controller';
import { QuestionBankRepository } from './repository/question-bank.repository.ts';

@Module({
  controllers: [QuestionBankController],
  providers: [QuestionBankService, QuestionBankRepository],
  exports: [QuestionBankRepository]
})
export class QuestionBankModule {}
