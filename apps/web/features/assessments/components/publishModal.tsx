// apps/web/features/assessments/components/PublishModal.tsx
'use client';

import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Select, SelectItem, Chip 
} from "@nextui-org/react";
import { usePublishLogic } from "../hooks/usePublishLogic";

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (selectedClassIds: string[]) => void;
  isLoading: boolean;
  schoolId: string; 
}

export default function PublishModal({ 
  isOpen, 
  onOpenChange, 
  onConfirm, 
  isLoading,
  schoolId
}: PublishModalProps) {
  
  // 🔌 Hubungkan ke "Otak" (Hook)
  const {
    isLoadingClasses,
    selectedLevel,
    setSelectedLevel,
    selectedClasses,
    levelOptions,
    filteredClasses,
    handleAddClass,
    handleRemoveClass,
    resetState
  } = usePublishLogic(schoolId);

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} placement="top-center" size="md">
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">Publish Ujian</ModalHeader>
            <ModalBody>
              <div className="bg-warning/10 text-warning-700 p-3 rounded-lg text-sm mb-2">
                <strong>Perhatian:</strong> Akses akan segera diberikan ke kelas yang dipilih.
              </div>

              {/* DROPDOWN 1: Pilih Level */}
              {/* 🔥 Solusi Error NextUI: Gunakan props 'items' */}
              <Select 
                items={levelOptions}
                label="Filter Level" 
                size="sm"
                selectedKeys={[selectedLevel]}
                onChange={(e) => setSelectedLevel(e.target.value)}
                isLoading={isLoadingClasses}
              >
                {(level) => <SelectItem key={level.id}>{level.name}</SelectItem>}
              </Select>

              {/* DROPDOWN 2: Pilih Kelas */}
              {/* 🔥 Solusi Error NextUI: Gunakan props 'items' */}
              <Select 
                items={filteredClasses}
                label="Pilih Kelas" 
                placeholder="Pilih kelas untuk ditambahkan..."
                size="sm"
                onChange={(e) => handleAddClass(e.target.value)}
                isLoading={isLoadingClasses}
                selectedKeys={[]} 
              >
                {(c) => <SelectItem key={c.id}>{c.name}</SelectItem>}
              </Select>

              {/* DAFTAR KELAS TERPILIH (CHIPS) */}
              <div className="mt-2">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Akses diberikan ke ({selectedClasses.length} Kelas):
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedClasses.length === 0 ? (
                    <span className="text-xs text-gray-400 italic">Belum ada kelas dipilih.</span>
                  ) : (
                    selectedClasses.map((c) => (
                      <Chip
                        key={c.id}
                        onClose={() => handleRemoveClass(c.id)}
                        variant="flat" color="primary" size="sm"
                      >
                        {c.name}
                      </Chip>
                    ))
                  )}
                </div>
              </div>

            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleClose}>
                Batal
              </Button>
              <Button 
                color="primary" 
                onPress={() => onConfirm(selectedClasses.map(c => c.id))} 
                isLoading={isLoading}
                isDisabled={selectedClasses.length === 0}
              >
                Publish Sekarang
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}