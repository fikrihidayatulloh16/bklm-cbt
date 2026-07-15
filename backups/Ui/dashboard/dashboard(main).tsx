// import Sidebar from './Sidebar';
// import StatCard from './StatCard';
// import AssessmentCard from './AssessmentCard';
// import BankSoalCard from './BankSoalCard';
// import ActivityFeed from './ActivityFeed';
// import { FileText, BookOpen, CheckCircle, Users, TrendingUp, TrendingDown } from 'lucide-react';

// function Dashboard() {
//   const stats = [
//     {
//       title: 'Total Assessment',
//       value: '3',
//       subtitle: 'Total Ujian Dibuat',
//       icon: FileText,
//       color: 'blue',
//       trend: { value: 12, isPositive: true },
//     },
//     {
//       title: 'Bank Soal',
//       value: '2',
//       subtitle: 'Bank Soal',
//       icon: BookOpen,
//       color: 'orange',
//       trend: { value: 0, isPositive: true },
//     },
//     {
//       title: 'Total Soal',
//       value: '26',
//       subtitle: 'Total Butir Soal',
//       icon: CheckCircle,
//       color: 'green',
//       trend: { value: 8, isPositive: true },
//     },
//     {
//       title: 'Siswa Mengerjakan',
//       value: '11',
//       subtitle: 'Siswa Mengerjakan',
//       icon: Users,
//       color: 'purple',
//       trend: { value: 5, isPositive: false },
//     },
//   ];

//   const recentAssessments = [
//     {
//       id: 1,
//       title: 'Ujian: Percobaan Assessment',
//       description: 'uji coba',
//       status: 'CLOSED',
//       questionCount: 22,
//       timeAgo: '5 Menit',
//     },
//     {
//       id: 2,
//       title: 'Ujian: Gaya Belajar',
//       description: 'Tidak ada deskripsi',
//       status: 'CLOSED',
//       questionCount: 2,
//       timeAgo: '5 Menit',
//     },
//     {
//       id: 3,
//       title: 'Ujian: Gaya Belajar',
//       description: 'Test assessment',
//       status: 'DRAFT',
//       questionCount: 2,
//       timeAgo: '5 Menit',
//     },
//   ];

//   const recentBankSoal = [
//     {
//       id: 1,
//       title: 'Percobaan Assessment',
//       description: 'Uji Coba Kelayakan',
//     },
//     {
//       id: 2,
//       title: 'Gaya Belajar',
//       description: 'asesments gaya belajar',
//     },
//   ];

//   return (
//     <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
//       <Sidebar />

//       <main className="flex-1 overflow-auto">
//         <div className="max-w-7xl mx-auto px-8 py-6">
//           <header className="mb-8">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold text-gray-900 mb-2">
//                   Halo, Selamat Datang! 👋
//                 </h1>
//                 <p className="text-gray-600">Berikut ringkasan aktivitas Anda Terakhir.</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="text-right">
//                   <p className="text-sm font-medium text-gray-900">Admin User</p>
//                   <p className="text-xs text-gray-500">Administrator</p>
//                 </div>
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
//                   A
//                 </div>
//               </div>
//             </div>
//           </header>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//             {stats.map((stat, index) => (
//               <StatCard key={index} {...stat} />
//             ))}
//           </div>

//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
//             <div className="lg:col-span-2">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-2">
//                   <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
//                     <FileText className="w-4 h-4 text-blue-600" />
//                   </div>
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Assessment Terbaru</h2>
//                     <p className="text-sm text-gray-500">Daftar ujian terakhir dibuat</p>
//                   </div>
//                 </div>
//                 <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors">
//                   Lihat Semua
//                   <span className="text-lg">→</span>
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 {recentAssessments.map((assessment) => (
//                   <AssessmentCard key={assessment.id} {...assessment} />
//                 ))}
//               </div>
//             </div>

//             <div>
//               <ActivityFeed />
//             </div>
//           </div>

//           <div>
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-2">
//                 <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
//                   <BookOpen className="w-4 h-4 text-orange-600" />
//                 </div>
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">Bank Soal Terbaru</h2>
//                   <p className="text-sm text-gray-500">Draf soal yang terakhir Anda edit</p>
//                 </div>
//               </div>
//               <button className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 transition-colors">
//                 Lihat Semua
//                 <span className="text-lg">→</span>
//               </button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {recentBankSoal.map((bank) => (
//                 <BankSoalCard key={bank.id} {...bank} />
//               ))}
//               <button className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 flex flex-col items-center justify-center gap-2 min-h-[140px] group">
//                 <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
//                   <span className="text-2xl text-gray-400 group-hover:text-blue-600">+</span>
//                 </div>
//                 <span className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Buat Bank Soal</span>
//               </button>
//             </div>
//           </div>
//         </div>
//       </main>
//     </div>
//   );
// }

// export default Dashboard;
