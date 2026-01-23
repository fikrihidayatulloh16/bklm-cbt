// components/fragments/question-bank/modal/addCat.modal.tsx
import { useState } from "react";
import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Input, Textarea 
} from "@nextui-org/react";
import { parseBulkYesNo } from "@/components/helper/excel-yes-no-parsers";

// Definisi tipe data pertanyaan (sesuaikan dengan schema zod Anda jika perlu)
interface QuestionItemData {
  text: string;
  type: "MULTIPLE_CHOICE" | "YES_NO" | "ESSAY";
  options: { label: string; score: number }[];
}

interface CreateCategoryQuestionModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  // Callback untuk mengirim data ke Parent
  onAddCategory: (categoryName: string, questions: QuestionItemData[]) => void;
}

export default function CreateCategoryQuestionModal({
  isOpen, 
  onOpenChange, 
  onAddCategory
}: CreateCategoryQuestionModalProps) {
  
  // State Lokal Modal (Cukup useState, tidak perlu useForm disini)
  const [newCategoryName, setNewCategoryName] = useState("");
  const [pasteContent, setPasteContent] = useState("");

  const handleSave = () => {
    // Validasi Sederhana
    if (!newCategoryName.trim()) {
        alert("Nama kategori wajib diisi!");
        return;
    }

    // 1. SOLUSI ERROR TS: Definisikan tipe array secara eksplisit
    let initialQuestions: QuestionItemData[] = []; 

    if (pasteContent.trim()) {
        const parsed = parseBulkYesNo(pasteContent);
        // Mapping hasil parsing
        initialQuestions = parsed.map(q => ({
            text: q.text,
            type: "YES_NO", // Pastikan string ini cocok dengan Zod Schema
            options: q.options
        }));
    }

    // 2. Kirim data ke Parent lewat Props
    onAddCategory(newCategoryName, initialQuestions);

    // 3. Reset & Tutup
    setNewCategoryName("");
    setPasteContent("");
    onOpenChange(); // Tutup modal
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Tambah Kategori Baru</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="Nama Kategori"
                placeholder="Contoh: Biologi Bab 1"
                variant="bordered"
                value={newCategoryName}
                onValueChange={setNewCategoryName}
              />
              
              <div className="my-2 border-t border-default-200"></div>
              
              <p className="text-sm font-bold text-default-600">Import Excel (Khusus tipe Ya/Tidak)</p>
              <Textarea
                placeholder="Paste dari excel kolom 1=[Soal] kolom 2=[YA/TIDAK]..."
                minRows={5}
                value={pasteContent}
                onValueChange={setPasteContent}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button color="primary" onPress={handleSave}>
                Simpan
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}