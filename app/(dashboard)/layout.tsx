// app/(dashboard)/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/custom/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full">
      {/* Sidebar for both mobile and desktop */}
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-slate-50 p-4 dark:bg-slate-950 md:p-8">
        {children}
      </main>
    </div>
  );
}