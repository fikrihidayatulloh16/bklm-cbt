// import { Clock, FileText } from 'lucide-react';

// interface AssessmentCardProps {
//   title: string;
//   description: string;
//   status: 'CLOSED' | 'DRAFT';
//   questionCount: number;
//   timeAgo: string;
// }

// function AssessmentCard({ title, description, status, questionCount, timeAgo }: AssessmentCardProps) {
//   const statusColors = {
//     CLOSED: 'bg-gray-100 text-gray-700 border-gray-200',
//     DRAFT: 'bg-amber-100 text-amber-700 border-amber-200',
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-100 group">
//       <div className="flex items-start justify-between mb-3">
//         <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[status]}`}>
//           {status}
//         </span>
//         <div className="flex items-center gap-1 text-xs text-gray-500">
//           <Clock className="w-3 h-3" />
//           <span>{timeAgo}</span>
//         </div>
//       </div>

//       <h3 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
//         {title}
//       </h3>
//       <p className="text-sm text-gray-600 mb-4 line-clamp-2">{description}</p>

//       <div className="flex items-center justify-between pt-4 border-t border-gray-100">
//         <div className="flex items-center gap-2 text-sm text-gray-600">
//           <FileText className="w-4 h-4" />
//           <span className="font-medium">{questionCount} Soal</span>
//         </div>
//         <button className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-all">
//           Detail
//         </button>
//       </div>
//     </div>
//   );
// }

// export default AssessmentCard;
