// apps/web/features/assessments/components/PublishModal.tsx
'use client';

import { 
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, 
  Button, Select, SelectItem, Chip, Input 
} from "@nextui-org/react";
import { Controller } from "react-hook-form";
import { usePublishLogic, PublishFormValues } from "../hooks/usePublishLogic";

// 🚨 PERHATIKAN: onConfirm sekarang menerima Object, bukan sekadar array string
export interface PublishPayload {
  session_name: string;
  class_ids: string[];
}

interface PublishModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (payload: PublishPayload) => void; 
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
  
  const {
    form,
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

  // Destructure form methods
  const { control, handleSubmit, formState: { errors } } = form;

  const handleClose = () => {
    resetState();
    onOpenChange(false);
  };

  // 🔥 Fungsi ini akan dipanggil oleh handleSubmit milik React Hook Form
  const onSubmitForm = (data: PublishFormValues) => {
    // Gabungkan data dari Input Text dan State Chip Kelas
    onConfirm({
      session_name: data.session_name,
      class_ids: selectedClasses.map(c => c.id)
    });
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={handleClose} placement="top-center" size="md">
      <ModalContent>
        {() => (
          // 🚨 PENTING: Bungkus dengan <form>
          <form onSubmit={handleSubmit(onSubmitForm)}>
            <ModalHeader className="flex flex-col gap-1">Publish Ujian</ModalHeader>
            <ModalBody>
              <div className="bg-warning/10 text-warning-700 p-3 rounded-lg text-sm mb-2">
                <strong>Perhatian:</strong> Akses akan segera diberikan ke kelas yang dipilih.
              </div>

              {/* INPUT: JUDUL SESI */}
              <Controller 
                name="session_name"
                control={control}
                render={({field}) => (
                  <Input
                    {...field}
                    label="Judul Sesi"
                    placeholder="Contoh: PTS Ganjil X MIPA 1"
                    variant="bordered"
                    size="sm"
                    // 🔥 FIX: Gunakan errors.session_name, bukan errors.title
                    errorMessage={errors.session_name?.message}
                    isInvalid={!!errors.session_name}
                  />
                )}
              />

              {/* DROPDOWN 1: Pilih Level */}
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
                    <span className="text-xs text-danger italic">Wajib memilih minimal 1 kelas.</span>
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
              {/* 🚨 Ubah jadi type="submit" dan hapus event onPress */}
              <Button 
                color="primary" 
                type="submit" 
                isLoading={isLoading}
                isDisabled={selectedClasses.length === 0}
              >
                Publish Sekarang
              </Button>
            </ModalFooter>
          </form>
        )}
      </ModalContent>
    </Modal>
  );
}