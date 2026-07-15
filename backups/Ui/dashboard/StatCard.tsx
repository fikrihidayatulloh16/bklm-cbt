// import { Video as LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

// interface StatCardProps {
//   title: string;
//   value: string;
//   subtitle: string;
//   icon: LucideIcon;
//   color: 'blue' | 'orange' | 'green' | 'purple';
//   trend?: {
//     value: number;
//     isPositive: boolean;
//   };
// }

// const colorClasses = {
//   blue: {
//     bg: 'bg-blue-50',
//     icon: 'text-blue-600',
//     gradient: 'from-blue-500 to-blue-600',
//     trend: 'bg-blue-100 text-blue-700',
//   },
//   orange: {
//     bg: 'bg-orange-50',
//     icon: 'text-orange-600',
//     gradient: 'from-orange-500 to-orange-600',
//     trend: 'bg-orange-100 text-orange-700',
//   },
//   green: {
//     bg: 'bg-green-50',
//     icon: 'text-green-600',
//     gradient: 'from-green-500 to-green-600',
//     trend: 'bg-green-100 text-green-700',
//   },
//   purple: {
//     bg: 'bg-purple-50',
//     icon: 'text-purple-600',
//     gradient: 'from-purple-500 to-purple-600',
//     trend: 'bg-purple-100 text-purple-700',
//   },
// };

// function StatCard({ title, value, subtitle, icon: Icon, color, trend }: StatCardProps) {
//   const colors = colorClasses[color];

//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden border border-gray-100 group">
//       <div className="p-6">
//         <div className="flex items-start justify-between mb-4">
//           <div className={`w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
//             <Icon className={`w-6 h-6 ${colors.icon}`} />
//           </div>
//           {trend && (
//             <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colors.trend}`}>
//               {trend.isPositive ? (
//                 <TrendingUp className="w-3 h-3" />
//               ) : (
//                 <TrendingDown className="w-3 h-3" />
//               )}
//               <span>{trend.value}%</span>
//             </div>
//           )}
//         </div>

//         <div>
//           <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
//           <h3 className="text-3xl font-bold text-gray-900 mb-2">{value}</h3>
//           <p className="text-xs text-gray-500">{subtitle}</p>
//         </div>
//       </div>

//       <div className={`h-1 bg-gradient-to-r ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
//     </div>
//   );
// }

// export default StatCard;
