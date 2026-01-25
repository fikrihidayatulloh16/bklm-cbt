// Kita butuh tipe data asli dari Prisma untuk Type Safety
import { BankQuestion, BankQuestionOption } from '@prisma/client';

// Helper Type: Mendefinisikan struktur data yang diambil dari DB
// (BankQuestion yang punya anak options)
type BankQuestionWithRelations = BankQuestion & { 
  options: BankQuestionOption[] 
};


export class AssessmentMapper {
  // Static Method: Hemat memori
  static mapFromBankQuestions(bankQuestions: BankQuestionWithRelations[]) {
    return bankQuestions.map((bq) => ({
      // Kita copy value-nya
      text: bq.text,
      type: bq.type, 
      category: bq.category,
      order: bq.order,
      
      // Kita susun struktur 'Nested Write' untuk Assessment
      options: {
        create: bq.options.map((opt) => ({
          label: opt.label,
          score: opt.score,
        }))
      }
    }));
  }

  static mapAnswerStats(rawAnswers: any[]) {
    const statsMap = new Map<string, any>();
    let grandTotalProblems = 0; // 1. Deklarasi di sini

    for (const ans of rawAnswers) {
      const qId = ans.question_id;
      const score = ans.option?.score ?? 0;

      // 2. Hitung Total di sini
      if (score > 0) {
        grandTotalProblems += score;
      }

      if (!statsMap.has(qId)) {
        statsMap.set(qId, {
          question_id: qId,
          question_text: ans.question?.text || "Soal tidak ditemukan",
          category: ans.question?.category || "-",
          total_risk_score: 0,
          respondents: 0
        });
      }

      const entry = statsMap.get(qId);
      if (entry) {
        entry.total_risk_score += score;
        entry.respondents += 1;
      }
    }

    // 3. Return keduanya (Map dan Total)
    return { 
      statsMap, 
      grandTotalProblems 
    };
  }

  static mapFinalReport(statsMap: any[], grandTotalProblems) {
    const Report = statsMap.map(item => {
        // [UBAH DISINI] Logic Rumus Klien: (Item Score / Grand Total Masalah) * 100
        // Contoh: (26 / 826) * 100 = 3.15%
        const percentage = grandTotalProblems > 0 
            ? (item.total_risk_score / grandTotalProblems) * 100 
            : 0;
            
        // [BARU] Logic Prioritas Sederhana (> 3%)
        const priority = percentage > 3.0 ? "TINGGI" : "RENDAH";

        return {
            ...item,
            // Kita kirim angka mentah & format string untuk fleksibilitas di Frontend/Excel
            percentageRaw: percentage, 
            percentage: percentage.toFixed(2) + '%',
            priority: priority,
            
            // Pertahankan average lama jika frontend masih butuh (opsional)
            average: item.respondents > 0 ? (item.total_risk_score / item.respondents) : 0
        };
    });

    // Urutkan dari Total Score Tertinggi (Jumlah Masalah Terbanyak)
    Report.sort((a, b) => b.total_risk_score - a.total_risk_score);

    return Report;
  }
}
