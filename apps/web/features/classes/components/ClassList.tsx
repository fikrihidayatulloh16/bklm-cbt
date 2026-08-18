// apps/web/features/classes/components/ClassList.tsx
'use client';

import { useState, useMemo, useEffect } from "react";
import { useClassesQuery } from "../queries/class.queries";
import { useClassUI } from "../hooks/useClassLogic";
import { ClassResponse } from "../schemas/class.schemas";
// Asumsi Anda menggunakan library icon seperti lucide-react
import { Edit2, Trash2, Plus, Users, UserCircle } from "lucide-react"; 
import ClassFormModal from "./ClassFormModal";

interface ClassListProps {
  schoolId: string;
}

export default function ClassList({ schoolId }: ClassListProps) {
  // 1. Ambil Data dan Kontrol UI
  const { data: classes, isLoading } = useClassesQuery(schoolId);
  const { isModalOpen, selectedClass, openAddModal, openEditModal, closeModal } = useClassUI();

  // 2. State untuk Tab Aktif
  const [activeTab, setActiveTab] = useState<string>("");

  // 3. Olah Data: Ekstrak Level unik untuk dijadikan Tabs
  const levels = useMemo(() => {
    // 🔥 Jika kosong ATAU bukan array, kembalikan array kosong
    if (!classes || !Array.isArray(classes)) {
        console.log("Data classes mentah:", classes); // 👈 Agar kita tahu bentuk aslinya di console!
        return [];
    }
    return Array.from(new Set(classes.map((c) => c.level))).sort();
  }, [classes]);

  // Set Tab default ke level pertama saat data dimuat
  useEffect(() => {
    if (levels.length > 0 && !activeTab) {
      setActiveTab(levels[0]);
    }
  }, [levels, activeTab]);

  // 4. Filter kelas berdasarkan Tab (Level) yang sedang aktif
  const filteredClasses = useMemo(() => {
    // 🔥 Pasang jaring pengaman yang sama
    if (!classes || !Array.isArray(classes)) return [];
    return classes.filter((c) => c.level === activeTab);
  }, [classes, activeTab]);

  if (isLoading) return <div className="p-10 text-center animate-pulse">Memuat data kelas...</div>;

  return (
    <div className="space-y-6">
      {/* HEADER & ACTION */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Kelas</h1>
          <p className="text-sm text-gray-500">Kelola daftar kelas dan rombongan belajar.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Tambah Kelas
        </button>
      </div>

      {/* EMPTY STATE (Jika belum ada kelas sama sekali) */}
      {levels.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada kelas yang terdaftar di sekolah ini.</p>
          <button onClick={openAddModal} className="text-blue-600 font-medium hover:underline">
            Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          
          {/* TABS NAVIGATION */}
          <div className="flex border-b border-gray-200 bg-gray-50 px-4">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setActiveTab(level)}
                className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === level
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Level {level}
              </button>
            ))}
          </div>

          {/* DATA TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Nama Kelas</th>
                  {/* 👇 Kolom untuk atribut masa depan (Kosong untuk MVP) */}
                  <th className="px-6 py-4 font-semibold">Wali Kelas</th>
                  <th className="px-6 py-4 font-semibold">Jumlah Siswa</th>
                  <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredClasses.map((cls: ClassResponse) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{cls.level} - {cls.name}</td>
                    
                    {/* Placeholder atribut masa depan */}
                    <td className="px-6 py-4 text-gray-400 flex items-center gap-2">
                      <UserCircle size={16} /> Belum diatur
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      <div className="flex items-center gap-2">
                        <Users size={16} /> -
                      </div>
                    </td>
                    
                    {/* AKSI EDIT/HAPUS (Sangat jelas dan tidak tumpang tindih) */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => openEditModal(cls)}
                          className="text-gray-400 hover:text-blue-600 transition"
                          title="Edit Kelas"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          // Nanti arahkan ke openDeleteModal jika ada
                          className="text-gray-400 hover:text-red-600 transition"
                          title="Hapus Kelas"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL FORM */}
      <ClassFormModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        schoolId={schoolId} 
        existingData={selectedClass} 
      />
    </div>
  );
}