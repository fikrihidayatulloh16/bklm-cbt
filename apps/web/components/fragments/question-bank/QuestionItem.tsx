// components/fragments/QuestionItem.tsx

import { 
  useWatch, 
  Control, 
  UseFormRegister, 
  UseFormSetValue, 
  FieldErrors 
} from "react-hook-form";
import { Button, Card, CardBody, Input, Select, SelectItem } from "@nextui-org/react"; // 👈 Pastikan Input dari sini!
import { Trash2 } from "lucide-react";
import OptionList from "../OptionList"; // Pastikan path benar

interface QuestionItemProps {
  control: Control<any>; // Jika masih error "not generic", hapus <any>. Cukup: Control;
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  errors: any;
  basePath: string;
  onRemove: () => void;
  index: number;
}

export default function QuestionItem({ 
  control, register, setValue, errors, basePath, onRemove, index 
}: QuestionItemProps) {
  
  // Helper error handling yang aman
  // Mengambil error spesifik dari path yang panjang
  const getError = () => {
      const parts = basePath.split('.'); // ['sections', '0', 'questions', '2']
      // Navigasi manual ke object error
      // @ts-ignore
      return errors?.[parts[0]]?.[parts[1]]?.[parts[2]]?.[index];
  };
  const specificError = getError();

  // 1. FIX useWatch: Paksa tipe return jadi string
  const questionType = useWatch({
    control,
    name: `${basePath}.type`,
    defaultValue: "MULTIPLE_CHOICE"
  }) as string; // 👈 Casting as string biar gak dianggap void

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value;
    setValue(`${basePath}.type`, newType);
    
    if (newType === "YES_NO") {
      setValue(`${basePath}.options`, [{ label: "Ya", score: 1 }, { label: "Tidak", score: 0 }]);
    } else {
      setValue(`${basePath}.options`, []);
    }
  };

  return (
    <Card className="bg-default-50 border border-default-200">
      <CardBody className="gap-4">
        <div className="flex justify-between items-start">
           <span className="font-bold text-default-500">#{index + 1}</span>
           <Button isIconOnly size="sm" color="danger" variant="light" onPress={onRemove}>
             <Trash2 size={16} />
           </Button>
        </div>

        <input type="hidden" {...register(`${basePath}.id`)} />
        
        <Input 
           {...register(`${basePath}.text`)}
           label="Pertanyaan"
           variant="bordered"
           className="bg-white"
           // Fix Error Handling
           isInvalid={!!specificError?.text}
           errorMessage={specificError?.text?.message}
        />
        
        <Select 
            label="Tipe" 
            variant="bordered"
            className="bg-white"
            // FIX selectedKeys: Pastikan array string valid, bukan void
            selectedKeys={questionType ? [questionType] : ["MULTIPLE_CHOICE"]} 
            onChange={handleTypeChange}
        >
            <SelectItem key="MULTIPLE_CHOICE">Pilihan Ganda</SelectItem>
            <SelectItem key="YES_NO">Ya / Tidak</SelectItem>
            <SelectItem key="ESSAY">Esai</SelectItem>
        </Select>

        <input type="hidden" {...register(`${basePath}.type`)} />
        
        {/* FIX OptionList: Kirim basePath agar OptionList tau lokasi datanya */}
         {questionType === "MULTIPLE_CHOICE" && (
             // Anda harus update file OptionList.tsx untuk menerima prop 'basePath' ini
             <OptionList 
                control={control} 
                nestIndex={index} 
                basePath={basePath} // 👈 Error disini akan hilang setelah langkah 4 dilakukan
                register={register}
                errors={errors}
                setValue={setValue}
             />
         )}
      </CardBody>
    </Card>
  )
}