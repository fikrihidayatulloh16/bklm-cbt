import { Spinner, Button, Card, CardBody, Chip } from "@nextui-org/react"
import { Calendar, CheckCircle2, Clock, FileText } from "lucide-react"
import router from "next/router"
import NextLink from "next/link";
import { ListAssessmentTypes } from "../schemas/assessment.schemas";
import { useRouter } from "next/navigation";

interface AssessmentCardListProps {
isLoading: boolean;
assessmentsList: ListAssessmentTypes[];
handleOpenCreateModal: () => void;
}

export const AssessmentCardList = ({isLoading, assessmentsList, handleOpenCreateModal}:AssessmentCardListProps) => {
const router = useRouter()
    return (
        <>
        {/* LIST CONTENT */}
        {isLoading ? (
        <div className="flex justify-center py-20"><Spinner label="Memuat jadwal..." color="primary" /></div>
      ) : assessmentsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-default-200 rounded-xl bg-default-50 text-center">
            <div className="bg-default-100 p-4 rounded-full mb-3">
                <Calendar size={32} className="text-default-400" />
            </div>
            <p className="text-default-600 font-medium">Belum ada jadwal ujian.</p>
            <p className="text-default-400 text-sm mb-4 max-w-xs mx-auto">
                Silakan buat assessment baru dengan mengambil data dari Bank Soal.
            </p>
            <Button size="sm" color="primary" variant="flat" onPress={handleOpenCreateModal}>
                Buat Sekarang
            </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {assessmentsList.map((item) => (
                 <Card 
                    key={item.id} 
                    className="border border-default-200 hover:border-primary-300 transition-colors" 
                    shadow="sm"
                    isPressable // Jadikan tombol
                    onPress={() => router.push(`/assessments/${item.id}`)} // Navigasi Programatik
                >
                    <CardBody className="gap-3 p-5">
                        <div className="flex justify-between items-start">
                            {/* Status Chip */}
                            <Chip 
                                size="sm" 
                                color={!item.assessment_status || item.assessment_status === 'DRAFT' ? "warning" : "success"} 
                                variant="flat"
                                startContent={<CheckCircle2 size={12} />}
                            >
                                {item.assessment_status || "ACTIVE"}
                            </Chip>
                            
                            {/* Duration Badge */}
                            <div className="flex items-center text-xs font-medium text-default-500 bg-default-100 px-2 py-1 rounded-full">
                                <Clock size={12} className="mr-1" />
                                <span>{item.duration /60000 || 60} Menit</span>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-lg leading-tight text-default-800">{item.title}</h3>
                            <p className="text-small text-default-500 mt-1 line-clamp-2">
                                {item.description || "Tidak ada deskripsi ujian."}
                            </p>
                        </div>
                        
                        {/* Footer Info (Optional) */}
                        <div className="pt-2 border-t border-default-100 flex justify-between items-center text-xs text-default-400 mt-2">
                            <span className="flex items-center gap-1">
                                <FileText size={14} />
                                {item._count || 0} Soal
                                
                            </span>
                            <span className="text-primary cursor-pointer hover:underline font-medium">Detail &rarr;</span>
                        </div>
                    </CardBody>
                 </Card>
             ))}
        </div>
      )}
      </>
    )
    
}