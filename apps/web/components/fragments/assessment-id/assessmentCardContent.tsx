'use client';

import { Card, CardBody, Divider } from "@nextui-org/react";
import { Clock, Users } from "lucide-react";
import Countdown from "react-countdown";
import { countdownRenderer } from "@/components/helper/countDownRenderer";


interface AssessmentCardContentProps {
  submissionsLength: number; // Menerima ARRAY submission
  assessmentDuration: number;      // Menerima ID Assessment (jika butuh)
  assessmentDeadLine: Date;      // Menerima ID Assessment (jika butuh)
}

export default function AssessmentCardContent({submissionsLength, assessmentDuration, assessmentDeadLine}: AssessmentCardContentProps) {

    
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
        </div>
    )
}
