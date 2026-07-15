// import { Activity, UserCheck, FileText, BookOpen, Clock } from 'lucide-react';

// function ActivityFeed() {
//   const activities = [
//     {
//       icon: FileText,
//       title: 'Assessment Created',
//       description: 'Percobaan Assessment dibuat',
//       time: '5 menit lalu',
//       color: 'blue',
//     },
//     {
//       icon: UserCheck,
//       title: 'Student Completed',
//       description: '3 siswa menyelesaikan ujian',
//       time: '12 menit lalu',
//       color: 'green',
//     },
//     {
//       icon: BookOpen,
//       title: 'Bank Soal Updated',
//       description: 'Gaya Belajar diperbarui',
//       time: '25 menit lalu',
//       color: 'orange',
//     },
//     {
//       icon: FileText,
//       title: 'Assessment Closed',
//       description: 'Ujian Gaya Belajar ditutup',
//       time: '1 jam lalu',
//       color: 'gray',
//     },
//   ];

//   const colorClasses: Record<string, { bg: string; icon: string }> = {
//     blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
//     green: { bg: 'bg-green-100', icon: 'text-green-600' },
//     orange: { bg: 'bg-orange-100', icon: 'text-orange-600' },
//     gray: { bg: 'bg-gray-100', icon: 'text-gray-600' },
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//       <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
//         <div className="flex items-center gap-2">
//           <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
//             <Activity className="w-4 h-4 text-green-600" />
//           </div>
//           <div>
//             <h3 className="font-bold text-gray-900">Recent Activity</h3>
//             <p className="text-xs text-gray-500">Latest updates</p>
//           </div>
//         </div>
//       </div>

//       <div className="p-5">
//         <div className="space-y-4">
//           {activities.map((activity, index) => {
//             const Icon = activity.icon;
//             const colors = colorClasses[activity.color];

//             return (
//               <div key={index} className="flex gap-3 group">
//                 <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
//                   <Icon className={`w-5 h-5 ${colors.icon}`} />
//                 </div>
//                 <div className="flex-1 min-w-0">
//                   <h4 className="font-semibold text-sm text-gray-900 mb-1">{activity.title}</h4>
//                   <p className="text-xs text-gray-600 mb-1 line-clamp-1">{activity.description}</p>
//                   <div className="flex items-center gap-1 text-xs text-gray-500">
//                     <Clock className="w-3 h-3" />
//                     <span>{activity.time}</span>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>

//       <div className="p-4 border-t border-gray-100 bg-gray-50">
//         <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
//           View All Activity →
//         </button>
//       </div>
//     </div>
//   );
// }

// export default ActivityFeed;
