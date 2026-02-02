"use client";

import { 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter, 
  Button 
} from "@nextui-org/react";
import { AlertTriangle } from "lucide-react"; // Ikon peringatan

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void; // Fungsi yang dijalankan saat klik "Hapus"
  isLoading?: boolean;   // Untuk loading spinner di tombol
  title?: string;        // Judul custom (Opsional)
  description?: string;  // Pesan custom (Opsional)
}

export const DeleteConfirmModal = ({
  isOpen,
  onOpenChange,
  onConfirm,
  isLoading = false,
  title = "Konfirmasi Hapus",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
}: DeleteConfirmModalProps) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onOpenChange={onOpenChange} 
      backdrop="blur" // Efek blur biar fokus
      placement="top-center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 items-center text-danger">
              <AlertTriangle size={48} className="mb-2" />
              {title}
            </ModalHeader>
            
            <ModalBody className="text-center text-default-500">
              <p>{description}</p>
            </ModalBody>
            
            <ModalFooter className="justify-center">
                <Button 
                color="danger" 
                onPress={onConfirm}
                isLoading={isLoading} // Spinner otomatis muncul disini
                >
                Ya, Hapus
                </Button>
                <Button 
                variant="light" 
                onPress={onClose} 
                isDisabled={isLoading}
                >
                Batal
                </Button>
              
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};