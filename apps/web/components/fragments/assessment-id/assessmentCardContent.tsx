'use client';

import { Button, Card, CardBody, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { Clock, Filter, Users } from "lucide-react";
import Countdown from "react-countdown";
import { countdownRenderer } from "@/components/helper/countDownRenderer";
import { useState } from "react";


interface AssessmentCardContentProps {
    submissionsLength: number; // Menerima ARRAY submission
    assessmentDuration: number;      // Menerima ID Assessment (jika butuh)
    assessmentDeadLine: Date;      // Menerima ID Assessment (jika butuh)
    selectedClassName: string;
    distinctClasses: string[];
    selectedKeys: string
    setSelectedKeys: (keys: Set<string>) => void;
    
}

export default function AssessmentCardContent({
    submissionsLength, 
    assessmentDuration, 
    assessmentDeadLine, 
    selectedClassName, 
    distinctClasses,
    selectedKeys,
    setSelectedKeys
}: AssessmentCardContentProps) {

    // State Dropdown (NextUI menggunakan Set untuk selection)
    // Default "all" artinya semua kelas
    // const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
    const dropdownItems = ["all", ...distinctClasses];
    
    return (

        <div>
            <Divider className="my-2"/>

            {/* --- STATISTIK RINGKAS (Layout Cards) --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card shadow="sm">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-primary-100 text-primary rounded-lg"><Clock size={24} /></div>
                        <div>
                            <p className="text-tiny text-default-500 uppercase font-bold">Durasi</p>
                            <h4 className="font-bold text-large">{assessmentDuration / 60000} Menit</h4>
                        </div>
                    </CardBody>
                </Card>
                <Card shadow="sm">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-secondary-100 text-secondary rounded-lg"><Users size={24} /></div>
                        <div>
                            <p className="text-tiny text-default-500 uppercase font-bold">Partisipan</p>
                            {/* Menggunakan panjang array submissions yang valid */}
                            <h4 className="font-bold text-large">{submissionsLength} Siswa</h4>
                        </div>
                    </CardBody>
                </Card>
                <Card shadow="sm">
                    <CardBody className="flex flex-row items-center gap-4">
                        <div className="p-3 bg-danger-100 text-primary rounded-lg"><Clock size={24} /></div>
                        <div>
                            <p className="text-tiny text-default-500 uppercase font-bold">Waktu Tersisa</p>
                            {assessmentDeadLine ? (
                                    <Countdown 
                                        date={assessmentDeadLine} 
                                        renderer={countdownRenderer} // Panggil helper yang sudah kita buat
                                        // onComplete={() => {
                                        //     // Logic ketika waktu habis
                                        //     window.location.reload(); 
                                        // }} 
                                    />
                                    ) : (
                                    // Tampilan Loading (Skeleton) saat menunggu API response
                                    <div className="flex items-center gap-2 px-1 py-2 rounded-lg bg-gray-100 text-dark-400 font-mono font-bold text-lg md:text-md">
                                        Assessment Tidak di Buka
                                    </div>
                                    )}
                        </div>
                    </CardBody>
                </Card>
            </div>

            <div className="w-full flex md:justify-end mb-4 mt-2">
                {/* ✨ DROPDOWN FILTER KELAS ✨ */}
                <Dropdown>
                    <DropdownTrigger>
                    <Button 
                        variant="flat" 
                        color="success"
                        startContent={<Filter size={18} />}
                    >
                        {selectedClassName || "Semua Kelas"}
                    </Button>
                    </DropdownTrigger>
                    <DropdownMenu 
                        aria-label="Filter Kelas"
                        disallowEmptySelection
                        selectionMode="single"
                        selectedKeys={selectedKeys}
                        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
                    >
                        {/* 2. Map satu array gabungan tersebut */}
                        {dropdownItems.map((item) => (
                        <DropdownItem 
                            key={item} 
                            // Logic styling conditional: Jika 'all', buat tebal/warna beda
                            className={item === "all" ? "text-primary font-bold border-b border-default-200" : ""}
                        >
                            {item === "all" ? "Tampilkan Semua" : item}
                        </DropdownItem>
                        ))}
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    )
}
