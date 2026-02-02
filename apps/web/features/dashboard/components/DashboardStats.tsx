import { Button, Card, CardBody, Chip } from "@nextui-org/react"
import { Plus, PlayCircle, AlertCircle, Clock, BookOpen, Users, HelpCircle, FileText } from "lucide-react"
import { DashboardStats } from "../types/dashboard.types"

interface Props {
    data: DashboardStats
}

export const DashboardStatsGrid = ({ data }: Props) => {
    return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      {/* CARD 1: Total Assessment */}
      <Card className="border-l-4 border-primary shadow-sm">
        <CardBody className="gap-2">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <FileText size={20} /> Total Assessment
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">
                {data.totalAssessment}
            </p>
            <p className="text-xs text-default-500">Total Ujian Dibuat</p>
          </div>
        </CardBody>
      </Card>

      {/* CARD 2: Total Question Bank */}
      <Card className="border-l-4 border-warning shadow-sm">
        <CardBody className="gap-2">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-warning/10 rounded-lg text-warning">
              <BookOpen size={20}  /> Bank Soal
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">
                {data.totalQuestionBank}
            </p>
            <p className="text-xs text-default-500">Bank Soal</p>
          </div>
        </CardBody>
      </Card>

      {/* CARD 3: Total Questions (Butir Soal) */}
      <Card className="border-l-4 border-success shadow-sm">
        <CardBody className="gap-2">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-success/10 rounded-lg text-success">
              <HelpCircle size={20} /> Total Soal
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">
                {data.totalQuestion}
            </p>
            <p className="text-xs text-default-500">Total Butir Soal</p>
          </div>
        </CardBody>
      </Card>

      {/* CARD 4: Submissions (Siswa Mengerjakan) */}
      <Card className="border-l-4 border-secondary shadow-sm">
        <CardBody className="gap-2">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <Users size={20} /> Siswa Mengerjakan
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-800">
                {data.totalSubmissions}
            </p>
            <p className="text-xs text-default-500">Siswa Mengerjakan</p>
          </div>
        </CardBody>
      </Card>

    </div>

    )
}