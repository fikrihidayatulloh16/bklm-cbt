export default function ExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Background netral, min-h-screen, tanpa sidebar
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {children}
    </div>
  );
}