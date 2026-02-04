'use client';

import React, { useEffect, useState } from "react";
import { 
  Button, Spinner, Modal, ModalContent, ModalHeader, 
  ModalBody, ModalFooter, useDisclosure, Select, SelectItem,
  Card, CardBody, Chip, Input 
} from "@nextui-org/react";
import { Plus, Calendar, Clock, FileText, CheckCircle2 } from "lucide-react"; 
import { Controller } from "react-hook-form";
import api from "@/lib/api"; 

import { showToast } from "@/components/ui/toast/toast-trigger";
import { useAssessmentMainLogic } from "@/features/assessments/hooks/useAssessmentMainLogic";
import NextLink from "next/link";
import { AssessmentCardList } from "@/features/assessments/components/AssessmentCardList";
import { CreateAssessmentModal } from "@/features/assessments/components/CreateAssessmentModal";

export default function AssessmentPage() {

  

  const { 
    isSubmitting, 
    handleSubmit, 
    handleOpenCreateModal, 
    isLoading, 
    assessmentsList, 
    questionBankOptions, 
    isError, 
    form,
    modalProps: {isOpen, onOpenChange, onClose}
  } = useAssessmentMainLogic()

  // Destruktur form methods
  const { control, setValue, formState: {errors} } = form

  return (
    // Tambahkan 'w-full', 'h-full', 'p-6' agar punya jarak napas dan tidak menabrak
    <div className="w-full h-full p-4 md:p-6 space-y-6">
      
      {/* HEADER PAGE - Menggunakan justify-between agar Judul di Kiri, Tombol di Kanan */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
        <div>
           <h2 className="text-2xl font-bold text-default-900">Jadwal Ujian</h2>
           <p className="text-default-500 text-sm">Kelola sesi ujian aktif untuk siswa.</p>
        </div>
        
        <Button 
          onPress={handleOpenCreateModal}
          color="primary" 
          className="font-semibold shadow-md"
          startContent={<Plus size={20} />}
        >
          Buat Jadwal Baru
        </Button>
      </div>

      {/* LIST CONTENT */}
      <AssessmentCardList
        isLoading={isLoading}
        assessmentsList={assessmentsList}
        handleOpenCreateModal={handleOpenCreateModal}
      />

      {/* --- MODAL FORM --- */}
      <CreateAssessmentModal
        form={form}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        questionBankOptions={questionBankOptions}
        handleSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}