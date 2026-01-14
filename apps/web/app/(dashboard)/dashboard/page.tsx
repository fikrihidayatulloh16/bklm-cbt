'use client';

import { Card, CardHeader, CardBody, Divider, Button } from "@nextui-org/react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Overview Guru</h2>
      
      {/* Grid Kartu Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kartu 1 */}
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Total Bank Soal</p>
              <p className="text-small text-default-500">Update hari ini</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <p className="text-4xl font-bold text-primary">24</p>
          </CardBody>
        </Card>

        {/* Kartu 2 */}
        <Card className="max-w-[400px]">
          <CardHeader className="flex gap-3">
            <div className="flex flex-col">
              <p className="text-md">Siswa Aktif</p>
              <p className="text-small text-default-500">Sedang online</p>
            </div>
          </CardHeader>
          <Divider/>
          <CardBody>
            <p className="text-4xl font-bold text-success">118</p>
          </CardBody>
        </Card>

        {/* Action Card */}
        <Card className="max-w-[400px] bg-primary text-white">
          <CardBody className="flex flex-col justify-center items-center gap-4">
            <p className="text-lg font-semibold">Buat Ujian Baru</p>
            <Button size="sm" className="bg-white text-primary font-bold">
              + Create Assessment
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}