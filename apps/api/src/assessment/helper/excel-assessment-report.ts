import * as ExcelJS from 'exceljs';

export class AssessmentHelper {
  
  static async generateAnalysisExcel(data: any): Promise<Buffer> {
    // 1. Setup Workbook & Sheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BKLM System';
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet('Analisis Masalah');

    // 2. Setup Kolom (Mapping Key untuk Data Row nanti)
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'soal', width: 55 },
      { key: 'kategori', width: 15 },
      { key: 'jumlah', width: 12 },
      { key: 'persentase', width: 12 },
      { key: 'prioritas', width: 15 },
    ];

    // 3. Header Judul Laporan (Insert di atas tabel)
    AssessmentHelper.addReportHeader(worksheet, data.grand_total_problems);

    // 4. Isi Data (Rows)
    // Data dimulai dari baris ke-5 (karena 4 baris pertama dipakai Header)
    const reportData = data.question_analysis;
    
    reportData.forEach((item, index) => {
      // Mapping data dari Service ke Key Kolom Excel
      const row = worksheet.addRow({
        no: index + 1,
        soal: item.question_text, // Ambil dari property asli object
        kategori: item.category,
        jumlah: item.respondents || item.jumlah, // Handle variasi nama field
        persentase: item.percentage,
        prioritas: item.priority
      });

      // 5. Styling per Baris
      AssessmentHelper.styleDataRow(row, item.priority);
    });

    // 6. Return Buffer (Casting ke Buffer agar aman di Controller)
    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  // ==========================================
  // PRIVATE HELPER (Untuk kerapihan kode)
  // ==========================================

  private static addReportHeader(worksheet: ExcelJS.Worksheet, totalProblems: number) {
    // Baris 1: Judul Utama
    worksheet.mergeCells('A1:F1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'LAPORAN ANALISIS KEBUTUHAN PESERTA DIDIK (AKPD)';
    titleCell.font = { name: 'Arial', size: 14, bold: true };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };

    // Baris 2: Sub-Judul Total
    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Total Identifikasi Masalah: ${totalProblems}`;
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Baris 4: Header Tabel
    const headerRow = worksheet.getRow(4);
    headerRow.values = ['No', 'Butir Masalah', 'Bidang', 'Jml Siswa', 'Persentase', 'Prioritas'];
    
    // Style Header Tabel (Biru, Teks Putih)
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
    });
  }

  private static styleDataRow(row: ExcelJS.Row, priority: string) {
    // Border & Alignment Dasar
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
      };
      // Kolom Soal (2) Rata Kiri & Wrap Text, Sisanya Tengah
      cell.alignment = { 
        vertical: 'middle', 
        horizontal: colNumber === 2 ? 'left' : 'center',
        wrapText: true 
      };
    });

    // Conditional Formatting (Warna Merah Muda jika TINGGI)
    // if (priority === 'TINGGI') {
    //   row.eachCell({ includeEmpty: true }, (cell) => {
    //     cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '#FFFFC7CE' } };
    //   });
    //   // Text Prioritas jadi Merah Tua
    //   row.getCell(6).font = { color: { argb: '#FF9C0006' }, bold: true };
    // }
  }
}