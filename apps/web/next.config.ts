import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    // Membatasi Next.js hanya menggunakan 1 core CPU saat proses build
    cpus: 1, 
    // Mematikan multi-threading agar RAM tidak meledak tiba-tiba
    workerThreads: false, 
  },
};

export default nextConfig;
