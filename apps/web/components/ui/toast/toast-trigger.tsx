import { toast } from "sonner";

// Tipe data biar coding enak ada autocomplete
type ToastType = "success" | "danger" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  description?: string;
}

export const showToast = ({ type, message, description }: ToastProps) => {
  switch (type) {
    case "success":
      toast.success(message, {
        description: description,
        duration: 3000,
      });
      break;
      
    case "danger":
      // Di sonner pakai .error, tapi kita mapping jadi 'danger' biar istilahnya sama kayak NextUI
      toast.error(message, {
        description: description,
        duration: 4000, 
      });
      break;

    case "warning":
      toast.warning(message, {
        description: description,
      });
      break;

    case "info":
      toast.info(message, {
        description: description,
      });
      break;
  }
};