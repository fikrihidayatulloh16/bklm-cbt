import { Modal, ModalContent, ModalHeader, ModalBody, Select, SelectItem, ModalFooter, Button, Input } from "@nextui-org/react";
import { Clock } from "lucide-react";
import { Controller, UseFormReturn } from "react-hook-form";
import { QuestionBankListType } from "@/features/question-bank/types/question-bank.types";
import { AssessmentFormValues } from "../schemas/assessment.schemas";



interface Props {
    form: UseFormReturn<AssessmentFormValues>;
    isOpen: boolean;
    onOpenChange: () => void;
    questionBankOptions: QuestionBankListType[];
    handleSubmit: () => void;
    isSubmitting: boolean;
}

export const CreateAssessmentModal = ({isOpen, onOpenChange, questionBankOptions, form, handleSubmit, isSubmitting}: Props) => {
    const { control, setValue, formState: {errors} } = form
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="top-center" size="lg" scrollBehavior="inside">
            <ModalContent>
            {(onClose) => (
                <>
                <ModalHeader>Buat Assessment Baru</ModalHeader>
                <ModalBody className="gap-5">
                    
                    {/* 1. PILIH BANK SOAL (Defensive Code Applied) */}
                    <Controller 
                    name="question_bank_id"
                    control={control}
                    render={({field}) => (
                        <Select
                        {...field}
                        label="Pilih Bank Soal"
                        placeholder="Pilih sumber soal..."
                        variant="bordered"
                        isLoading={!questionBankOptions}
                        selectedKeys={field.value ? [field.value] : []}
                        errorMessage={errors.question_bank_id?.message}
                        isInvalid={!!errors.question_bank_id}
                        onChange={(e) => {
                            field.onChange(e);

                            const selectedId = e.target.value;
                            const selectedBank = questionBankOptions?.find(b => b.id === selectedId);
                            
                            if (selectedBank) {
                                // Pakai setValue, bukan setFormData
                                setValue("title", `Ujian: ${selectedBank.title}`); 
                            }
                        }}
                        >
                        {(Array.isArray(questionBankOptions) ? questionBankOptions : []).map((bank) => (
                            <SelectItem key={bank.id} textValue={bank.title}>
                                {bank.title} ({bank._count?.questions || 0} Soal)
                            </SelectItem>
                        ))}
                    </Select>
                    )}
                    />
                    

                    {/* 2. JUDUL */}
                    <Controller 
                    name="title"
                    control={control}
                    render={({field}) => (
                        <Input
                        {...field}
                        label="Judul Ujian"
                        placeholder="Contoh: UTS Fisika Kelas 10"
                        variant="bordered"
                        errorMessage={errors.title?.message}
                        isInvalid={!!errors.title}
                        />
                    )}
                    />
                    

                    {/* 3. DESKRIPSI */}
                    <Controller 
                    name="description"
                    control={control}
                    render={({field}) => (
                        <Input
                        {...field}
                        label="Deskripsi (Opsional)"
                        placeholder="Keterangan singkat..."
                        variant="bordered"
                        />
                    )}
                    />
                    

                    {/* 4. DURASI */}
                    <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                        <Input
                        {...field}
                        label="Durasi (Menit)"
                        type="number"
                        variant="bordered"
                        value={String(field.value)}
                        
                        endContent={<span className="text-default-400 text-small">Menit</span>}
                        startContent={<Clock size={16} className="text-default-400" />}
                        errorMessage={errors.duration?.message}
                        isInvalid={!!errors.duration}
                        // Pastikan input number terhandle dengan benar
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                    )}
                    />
                    

                </ModalBody>
                <ModalFooter>
                    <Button color="danger" variant="light" onPress={onClose}>
                    Batal
                    </Button>
                    <Button 
                        color="primary" 
                        onPress={handleSubmit} 
                        isLoading={isSubmitting}
                    >
                    Simpan & Generate
                    </Button>
                </ModalFooter>
                </>
            )}
            </ModalContent>
        </Modal>
    )
}