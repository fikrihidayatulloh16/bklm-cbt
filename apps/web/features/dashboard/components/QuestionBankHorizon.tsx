import { Button, Card, CardBody, CardFooter, Chip } from "@nextui-org/react"
import { div } from "framer-motion/client"
import { FileText, ChevronRight, Plus } from "lucide-react"
import { LastQuestionBank } from "../types/dashboard.types"
import Link from "next/link";

interface Props {
    data: LastQuestionBank[]
}

export const QuestionBankList = ({data}: Props) => {
    return (
    // =========================================================
    // SECTION 3: RECENT BANK SOAL (DRAFT) - Horizontal Scroll
    //========================================================= 
    <div className="space-y-4">
        {/* Section Header */}
        <div className="flex justify-between items-end px-1">
            <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText size={22} className="text-warning-600"/> Bank Soal Terbaru
            </h2>
                <p className="text-xs text-default-400">Draft soal yang terakhir Anda edit</p>
            </div>
            <Button size="sm" variant="light" color="primary" as={Link} href={`/question-bank/`} endContent={<ChevronRight size={16}/>}>
            Lihat Semua
            </Button>
        </div>

        {/* Scrollable Container */}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            {data.map((item) => (
                <Card key={item.id} isPressable as={Link} href={`/question-bank/${item.id}`} className="min-w-[240px] max-w-[240px] snap-center border border-default-200 hover:border-warning-300 transition-all">
                    <CardBody className="flex flex-row items-center gap-4 p-4">
                        <div className="h-12 w-12 min-w-[3rem] rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                            BANK
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-sm truncate">{item.title}</h4>
                            <p className="text-xs text-default-400 mt-1">{item.description}</p>
                        </div>
                    </CardBody>
                    <CardFooter className="border-t border-default-100 py-2 justify-between">
                        <Button size="sm" fullWidth  color="default">Detail</Button>
                    </CardFooter>
                </Card>
            ))}
            
            {/* Add New Quick Card */}
            <Card isPressable className="min-w-[100px] max-w-[100px] snap-center border border-dashed border-default-300 bg-default-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-default-400">
                    <Plus />
                    <span className="text-xs font-semibold">Buat</span>
                </div>
            </Card>

            <div className="min-w-[20px]"></div> 
        </div>
    </div>
    )
}