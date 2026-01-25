import { Button, Card, CardBody, CardHeader, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from "@nextui-org/react";
import React from "react";

// --- 1. UPDATE INTERFACE (Sesuai Backend Service Anda) ---
export interface Submission {
  id: string;
  student_name: string;
  class_name: string; // Tambahan dari backend
  score: number;
  status: "FINISHED" | "IN_PROGRESS";
  submitted_at: string | null;
}

interface StudentProps {
  submissions: Submission[]; // Menerima ARRAY submission
  assessmentId: string;      // Menerima ID Assessment (jika butuh)
  handleSyncStatus: () => void
  loading: boolean
  assessment_status: string;
}

// --- 2. MAP WARNA STATUS ---
const statusColorMap: Record<string, "success" | "warning" | "default"> = {
  FINISHED: "success",
  IN_PROGRESS: "warning",
};

//Terima dta lewat props
export default function TabStudentRank({ submissions, assessmentId, handleSyncStatus, loading, assessment_status }: StudentProps) {
    return (
        <Card className="mt-4 shadow-sm border border-default-200">
            <CardHeader className="flex flex-col flex-row justify-between items-start md:items-center gap-4">
                <h2>Tabel Siswa</h2>
                <div className="">
                    { assessment_status !== "PUBLISHED" && (<Button
                    onPress={handleSyncStatus}
                    isDisabled={loading}
                    radius="full"
                    color="warning" 
                    className="mx-1"
                    // variant="ghost"
                    
                    // isLoading={isSyncing}
                    >
                    Sinkron Status
                </Button>)}
                </div>
                
            </CardHeader>
            <CardBody className="p-0">
                {submissions.length > 0 ? (
                    <Table aria-label="Tabel Nilai Siswa" removeWrapper shadow="none">
                        <TableHeader>
                            <TableColumn>NAMA SISWA</TableColumn>
                            <TableColumn>KELAS</TableColumn>
                            <TableColumn>WAKTU SUBMIT</TableColumn>
                            <TableColumn>STATUS</TableColumn>
                            <TableColumn>NILAI</TableColumn>
                        </TableHeader>
                        <TableBody items={submissions}>
                            {(sub) => (
                                <TableRow key={sub.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                                    <TableCell>
                                        <User 
                                            name={sub.student_name} 
                                            description="Siswa"
                                            avatarProps={{src: `https://i.pravatar.cc/150?u=${sub.id}`}}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-gray-600">{sub.class_name || "-"}</span>
                                    </TableCell>
                                    <TableCell>
                                        {sub.submitted_at 
                                            ? new Date(sub.submitted_at).toLocaleString('id-ID', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })
                                            : "-"
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <Chip size="sm" color={statusColorMap[sub.status]} variant="flat" className="capitalize">
                                            {sub.status === "FINISHED" ? "Selesai" : "Mengerjakan"}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        {sub.status === "FINISHED" ? (
                                            <span className={`font-bold text-lg ${sub.score < 70 ? 'text-danger' : 'text-success'}`}>
                                            {sub.score}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300">-</span>
                                        )}
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
        </Card>
    )
}