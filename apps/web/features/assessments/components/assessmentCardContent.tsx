'use client';

import { Button, Card, CardBody, Divider, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import { Clock, Filter, Users } from "lucide-react";
import Countdown, { CountdownRenderProps } from "react-countdown";
import { countdownRenderer } from "@/components/helper/countDownRenderer";
import { Dispatch, SetStateAction, useState } from "react";

interface AssessmentCardContentProps {
    submissionsLength: number; // Menerima ARRAY submission
    assessmentDuration: number;      // Menerima ID Assessment (jika butuh)
    assessmentDeadLine: Date | null;      // Menerima ID Assessment (jika butuh)
    selectedClassName: string;
    distinctClasses: string[];
    selectedKeys: Set<string>;
    setSelectedKeys: Dispatch<SetStateAction<Set<string>>>;
    handleComplete: () => void;
}

export default function AssessmentCardContent({
    submissionsLength, 
    assessmentDuration, 
    assessmentDeadLine, 
    selectedClassName, 
    distinctClasses,
    selectedKeys,
    setSelectedKeys,
    handleComplete
}: AssessmentCardContentProps) {

    const [isTimeUp, setIsTimeUp] = useState(false);
    // Wrapper agar bisa update state lokal UI juga
    const onTimerComplete = () => {
        setIsTimeUp(true);
        handleComplete(); // 👈 Panggil logic dari Hook
    };

    // State Dropdown (NextUI menggunakan Set untuk selection)
    // Default "all" artinya semua kelas
    // const [selectedKeys, setSelectedKeys] = useState(new Set(["all"]));
    const dropdownItems = ["all", ...distinctClasses];
    
    return (
        <div>
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
                        <div className="p-3 bg-danger-100 text-primary rounded-lg">
                        <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-tiny text-default-500 uppercase font-bold">Waktu Tersisa</p>
                            {assessmentDeadLine ? (
                                <Countdown 
                                    key={assessmentDeadLine.toString()} // Trik reset timer
                                    date={assessmentDeadLine} 
                                    renderer={countdownRenderer} 
                                    onComplete={onTimerComplete} 
                                />
                            ) : (
                                <div className="font-mono text-lg font-bold">
                                    {assessmentDuration} Menit
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
