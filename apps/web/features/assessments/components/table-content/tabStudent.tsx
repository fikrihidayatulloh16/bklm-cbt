import { Button, Card, CardBody, CardHeader, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, User } from "@nextui-org/react";
import { SubmissionType } from "@/features/assessments/schemas/assessment.schemas";
import { getInitials } from "@/lib/utils/initName";
import { useRouter } from "next/navigation";

interface StudentProps {
  submissions: SubmissionType[]; // Menerima ARRAY submission
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
    const router = useRouter()
    return (
        <Card className="mt-4 shadow-sm border border-default-200">
            <CardHeader className="flex flex-col flex-row justify-between items-start md:items-center gap-4">
                <h2>Tabel Siswa</h2>
                <div className="">
                    { assessment_status !== "PUBLISHED" && (
                        <Button
                            onPress={handleSyncStatus}
                            isDisabled={loading}
                            radius="full"
                            color="warning" 
                            className="mx-1"
                            // variant="ghost"
                            
                            isLoading={loading}
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
                            <TableColumn>AKSI</TableColumn>
                        </TableHeader>
                        <TableBody items={submissions}>
                            {(sub) => (
                                <TableRow key={sub.id} className="hover:bg-gray-50 border-b border-gray-100 last:border-none">
                                    <TableCell>
                                        <User 
                                            name={sub.student_name} 
                                            description="Siswa"
                                            avatarProps={{
                                                // Hapus 'src', ganti dengan 'name' yang sudah di-format
                                                name: getInitials(sub.student_name),
                                                // Tambahkan warna agar inisialnya terlihat jelas (opsional)
                                                className: "bg-green-100 text-blue-600 font-bold" 
                                            }}
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
                                    {/* Kolom Aksi Baru */}
                                    <TableCell>
                                        {/* <div className="flex items-center"> */}
                                            <Button 
                                                size="sm" 
                                                color="primary" 
                                                variant="flat"
                                                onPress={() => router.push(`/assessments/${assessmentId}/student-answer/${sub.id}`)}
                                            >
                                                Detail
                                            </Button>
                                            {/* Ruang untuk tombol lain di masa depan */}
                                        {/* </div> */}
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