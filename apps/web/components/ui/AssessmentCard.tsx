import { Card, CardHeader, CardBody, CardFooter, Chip, Divider } from "@nextui-org/react";

interface AssessmentCardProps {
  id: string;
  title: string;
  createdAt: string;
  // Tambahkan props lain jika perlu (misal description)
}

export default function AssessmentCard({ id, title, createdAt }: AssessmentCardProps) {
  return (
    <Card className="border-none hover:scale-[1.02] transition-transform duration-200" shadow="sm" isPressable onPress={() => console.log("Navigate to detail...")}>
      <CardHeader className="flex justify-between items-start px-5 pt-5 pb-0">
        <div className="flex flex-col items-start">
          <p className="text-tiny uppercase font-bold text-default-400">UMUM</p>
          <h4 className="font-bold text-large text-default-700 leading-tight mt-1 text-left">
            {title}
          </h4>
        </div>
        <Chip size="sm" variant="flat" color="success">Active</Chip>
      </CardHeader>
      
      <CardBody className="px-5 py-4">
        <div className="text-small text-default-500 bg-default-100 p-3 rounded-lg">
          ID: {id.substring(0, 8)}... {/* Persingkat ID agar rapi */}
        </div>
      </CardBody>
      
      <Divider className="bg-default-100" />
      
      <CardFooter className="px-5 py-4 text-tiny text-default-400">
        Dibuat: {new Date(createdAt).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}
      </CardFooter>
    </Card>
  );
}