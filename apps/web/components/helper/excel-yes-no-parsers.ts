// apps/web/src/utils/excel-parsers.ts

export interface ParsedQuestion {
  text: string;
  category: string; // Tetap ada di interface, tapi nanti diisi string kosong jika dari modal
  type: string;
  options: { label: string; score: number }[];
}

export const parseBulkYesNo = (rawText: string): ParsedQuestion[] => {
  if (!rawText) return [];

  const rows = rawText.trim().split('\n');

  return rows.map((row) => {
    // Split berdasarkan Tab
    const columns = row.split('\t');

    // Variabel penampung
    let textRaw = "";
    let answerKey = "";
    
    // LOGIKA DETEKSI KOLOM 🧠
    if (columns.length === 2) {
        // KASUS 2 KOLOM (Modal): [0] Soal | [1] Kunci
        textRaw = columns[0]?.trim();
        answerKey = columns[1]?.trim().toUpperCase();
    } else if (columns.length >= 3) {
        // KASUS 3 KOLOM (Format Lama): [0] Kategori | [1] Soal | [2] Kunci
        // columns[0] kategori kita abaikan disini karena nanti di-override oleh Modal
        textRaw = columns[1]?.trim();
        answerKey = columns[2]?.trim().toUpperCase();
    } else {
        // Format tidak dikenali
        return null;
    }

    // Validasi
    if (!textRaw || !answerKey) return null;

    // Bersihkan karakter aneh di kunci jawaban (kadang ada spasi)
    // Pastikan hanya ambil kata depannya saja jika user menulis "YA (Benar)"
    const cleanKey = answerKey.includes("YA") ? "YA" : (answerKey.includes("TIDAK") ? "TIDAK" : "");

    if (!cleanKey) return null; // Skip jika kuncinya bukan YA/TIDAK

    return {
      text: textRaw,
      category: "", // Kosongkan, nanti diisi oleh Modal
      type: "YES_NO",
      options: [
        {
          label: "Ya",
          score: cleanKey === "YA" ? 1 : 0, // Ubah skor sesuai kebutuhan (1 atau 10)
        },
        {
          label: "Tidak",
          score: cleanKey === "TIDAK" ? 1 : 0,
        }
      ]
    };
  }).filter((item): item is ParsedQuestion => item !== null);
};