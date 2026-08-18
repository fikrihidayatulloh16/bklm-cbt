// apps/web/features/classes/hooks/useClassLogic.ts
import { useState } from "react";
import { ClassFormValues } from "../schemas/class.schemas";

export const useClassUI = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassFormValues | null>(null);

  const openAddModal = () => {
    setSelectedClass(null);
    setIsModalOpen(true);
  };

  const openEditModal = (classData: ClassFormValues) => {
    setSelectedClass(classData);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  return {
    isModalOpen,
    selectedClass,
    openAddModal,
    openEditModal,
    closeModal,
  };
};