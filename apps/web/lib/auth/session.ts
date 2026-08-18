// apps/web/lib/auth/session
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  email: string;
  role: string;
  schoolId: string | null;
}

// 🔥 Tambahkan 'async' dan bungkus return type dengan Promise
export const getServerSession = async (): Promise<SessionData | null> => {
  // 🔥 Tambahkan 'await' di sini!
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value; 

  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf-8'));
    
    return {
      userId: decodedPayload.sub,
      email: decodedPayload.email,
      role: decodedPayload.role,
      schoolId: decodedPayload.schoolId || null, 
    };
  } catch (error) {
    console.error("⚠️ Gagal mengekstrak sesi JWT:", error);
    return null;
  }
};