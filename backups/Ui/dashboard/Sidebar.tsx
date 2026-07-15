// import { LayoutDashboard, FileText, BookOpen, Users, LogOut } from 'lucide-react';

// function Sidebar() {
//   const menuItems = [
//     { icon: LayoutDashboard, label: 'Dashboard', active: true },
//     { icon: FileText, label: 'Assessment', active: false },
//     { icon: BookOpen, label: 'Bank Soal', active: false },
//     { icon: Users, label: 'Data Siswa', active: false },
//   ];

//   return (
//     <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white flex flex-col shadow-2xl">
//       <div className="p-6 border-b border-slate-700">
//         <div className="flex items-center gap-3">
//           <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
//             <LayoutDashboard className="w-6 h-6" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold">BKLM ADMIN</h1>
//             <p className="text-xs text-slate-400">v1.0.0 Alpha</p>
//           </div>
//         </div>
//       </div>

//       <nav className="flex-1 p-4">
//         <ul className="space-y-2">
//           {menuItems.map((item, index) => {
//             const Icon = item.icon;
//             return (
//               <li key={index}>
//                 <button
//                   className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
//                     item.active
//                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
//                       : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
//                   }`}
//                 >
//                   <Icon className="w-5 h-5" />
//                   <span className="font-medium">{item.label}</span>
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>

//       <div className="p-4 border-t border-slate-700">
//         <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-red-600/20 hover:text-red-400 transition-all duration-200">
//           <LogOut className="w-5 h-5" />
//           <span className="font-medium">Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

// export default Sidebar;
