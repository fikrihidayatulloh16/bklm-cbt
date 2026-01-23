import { Button, Card, CardBody, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from "@nextui-org/react";
import { div } from "framer-motion/client";
import { Download, Play } from "lucide-react";
import React from "react";

// --- 1. UPDATE INTERFACE (Sesuai Backend Service Anda) ---
export interface QuestionsAnalytic {
  id: string;
  question_id: string;
  question_text: string;
  category: string; // Tambahan dari backend
  respondents: number;
  total_risk_score: number;
  average: number;
}

interface QuestionsAnalyticProps {
  questionsAnalytic: QuestionsAnalytic[]; // Menerima ARRAY submission
  assessmentId: string;      // Menerima ID Assessment (jika butuh)
  onDownload: () => void;
  isDownloading?: boolean;
}

//Terima dta lewat props
export default function QuestionsAnalytics({ questionsAnalytic, assessmentId, onDownload, isDownloading }: QuestionsAnalyticProps) {
    console.log('questionAnalytics di filetab= ',questionsAnalytic);
    
    return (
        <>
        <div>
            {questionsAnalytic.length > 0 ? (
                        <><Button
                        // onPress={onDownload}
                        color="danger"
                        className="font-semibold shadow-md md:w-auto mx-2"
                        startContent={<Download size={18} />}
                    >
                        PDF
                    </Button>
                    <Button
                        onPress={onDownload}
                        disabled={isDownloading} //Disable ketika download
                        color="success"
                        className={`items-center gap-2 px-3 py-1.5  text-sm transition-colors ${isDownloading
                                ? "bg-gray-400 cursor-not-allowed text-white"
                                : "bg-green-600 hover:bg-green-700 text-white"}`}
                        startContent={<Download size={18} />}
                    >
                            {isDownloading ? (
                                <>Downloading...</>
                            ) : (
                                <> Excel </>
                            )}
                        </Button></>
                    ) : ( '' )}
        </div>
       
        
        <Card className="mt-4 shadow-sm border border-default-200">
                <CardBody className="p-0">
                    {questionsAnalytic.length > 0 ? (
                        <Table aria-label="Tabel Nilai Siswa" removeWrapper shadow="none">
                            <TableHeader>
                                {/* <TableColumn>No.</TableColumn> */}
                                <TableColumn>Pertanyaan</TableColumn>
                                <TableColumn>Kategori</TableColumn>
                                <TableColumn>Responden</TableColumn>
                            </TableHeader>
                            <TableBody items={questionsAnalytic}>
                                {(quest) => (
                                    <TableRow key={quest.question_id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                                        <TableCell>
                                            <p className="font-semibold">{quest.question_text || "-"}</p>
                                            {/* <User
                                                    name={quest.question_text}
                                                    description="Siswa"
                                                    // avatarProps={{src: `https://i.pravatar.cc/150?u=${quest.id}`}}
                                                /> 
                                            */}
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-gray-600">{quest.category || "-"}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="font-semibold text-gray-600 text-center">{quest.total_risk_score || "-"}</span>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-12 text-default-400">
                            <p>Belum ada siswa yang mengerjakan ujian ini.</p>
                            {/* <div className="mt-4 md:hidden">
                    <p className="text-xs mb-2">Bagikan link ini ke siswa:</p>
                    <Snippet symbol="" size="sm" color="default" codeString={examLink}>Copy Link</Snippet>
            </div> */}
                        </div>
                    )}
                </CardBody>
            </Card></>
    )
}