'use client';

import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button 
} from "@nextui-org/react";

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export default function PublishModal({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isLoading 
}: PublishModalProps) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">Konfirmasi Publish</ModalHeader>
            <ModalBody>
              <p>
                Apakah Anda yakin ingin mempublish ujian ini? 
              </p>
              <p className="text-sm text-gray-500">
                Setelah dipublish, waktu hitung mundur (Deadline) akan dimulai dan siswa dapat mulai mengerjakan.
                Status tidak bisa dikembalikan ke DRAFT.
              </p>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={onClose}>
                Batal
              </Button>
              <Button 
                color="primary" 
                onPress={onConfirm} 
                isLoading={isLoading}
              >
                Ya, Publish Sekarang
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}