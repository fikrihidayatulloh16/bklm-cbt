import { Card, CardBody, CardFooter, Button, Chip } from "@nextui-org/react";
import { PlayCircle, ChevronRight, Clock, Calendar, FileText } from "lucide-react";
import { LastAssessment } from "../types/dashboard.types";
import Link from "next/link";

interface Props {
    data: LastAssessment[]
}

export const AssessmentList = ({ data }: Props) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <PlayCircle size={22} className="text-primary"/> Assessment Terbaru
          </h2>
          <p className="text-xs text-default-400">Daftar ujian terakhir dibuat</p>
        </div>
        <Button size="sm" variant="light" color="primary" as={Link} href={`/assessments/`} endContent={<ChevronRight size={16}/>}>
          Lihat Semua
        </Button>
      </div>

      <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {data.map((item) => (
          <Card 
            key={item.id}
            as={Link}
            isPressable 
            href={`/assessments/${item.id}`}  
            className="min-w-[280px] max-w-[280px] snap-center border border-default-200"
          >
            <CardBody className="gap-3">
              <div className="flex justify-between items-start">
                <Chip size="sm" color="primary" variant="flat">
                  {/* Tampilkan Status */}
                  {item.assessment_status} 
                </Chip>
                <div className="flex items-center gap-1 text-xs text-default-500">
                   <Clock size={14} /> {item.duration/60000} Menit
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg leading-tight line-clamp-2">{item.title}</h3>
                <p className="text-sm text-default-500 mt-1 line-clamp-1">{item.description || "Tidak ada deskripsi"}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-default-500 mt-2">
                {/* Akses _count dengan aman (optional chaining) */}
                <FileText size={14}/> {item._count?.questions || 0} Soal
              </div>
            </CardBody>
            <CardFooter className="pt-0">
               <Button size="sm" fullWidth color="default">Detail</Button>
            </CardFooter>
          </Card>
        ))}
        
        {data.length === 0 && (
            <div className="p-4 text-default-400 text-sm">Belum ada assessment dibuat.</div>
        )}
        <div className="min-w-[20px]"></div> 
      </div>
    </div>
  );
};