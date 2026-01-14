'use client';

import { Card, CardHeader, CardBody, CardFooter, Chip, Divider } from "@nextui-org/react";
import { useRouter } from "next/navigation"; // Import useRouter

interface AssessmentCardProps {
  id: string;
  title: string;
  createdAt: string;
}

export default function AssessmentCard({ id, title, createdAt }: AssessmentCardProps) {
  const router = useRouter(); // Hook navigasi

  // Fungsi pindah halaman
  const handlePress = () => {
    router.push(`question-bank/${id}`);
  };

  return (
    // HAPUS wrapper NextLink
    <Card 
      className="border-none hover:scale-[1.02] transition-transform duration-200 h-full" 
      shadow="sm" 
      isPressable // Pastikan ini ada agar kursor jadi pointer
      onPress={handlePress} // Panggil fungsi navigasi di sini
    >
      <CardHeader className="flex justify-between items-start px-5 pt-5 pb-0">
        <div className="flex flex-col items-start">
          <p className="text-tiny uppercase font-bold text-default-400">BANK SOAL</p>
          <h4 className="font-bold text-large text-default-700 leading-tight mt-1 text-left">
            {title}
          </h4>
        </div>
        <Chip size="sm" variant="flat" color="success">Active</Chip>
      </CardHeader>
      
      <CardBody className="px-5 py-4">
        <div className="text-small text-default-500 bg-default-100 p-3 rounded-lg">
          ID: {id.substring(0, 8)}...
        </div>
      </CardBody>
      
      <Divider className="bg-default-100" />
      
      <CardFooter className="px-5 py-4 text-tiny text-default-400">
        Dibuat: {new Date(createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
      </CardFooter>
    </Card>
  );
}