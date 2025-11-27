// components/custom/Sidebar.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart2, FileText, GitPullRequest, Home, Menu, Scan } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
  { href: '/pages', label: 'Pages', icon: <FileText className="h-5 w-5" /> },
  { href: '/nfc-tags', label: 'NFC Tags', icon: <Scan className="h-5 w-5" /> },
  { href: '/assignments', label: 'Assignments', icon: <GitPullRequest className="h-5 w-5" /> },
  { href: '/analytics', label: 'Analytics', icon: <BarChart2 className="h-5 w-5" /> },
];

const Sidebar = () => {
  return (
    <>
      {/* Desktop Sidebar (visible on screens larger than md) */}
      <aside className="hidden h-full w-20 flex-col items-center border-r bg-white p-4 dark:border-r-slate-800 dark:bg-slate-900 md:flex">
        <div className="flex-1 space-y-4 pt-4">
          <TooltipProvider>
            {navItems.map((item) => (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white">
                      {item.icon}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile Sidebar (hidden on screens larger than md) */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" className="m-4">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-4">
            <h2 className="mb-8 text-xl font-bold">Universal NFC CMS</h2>
            <div className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant="ghost" className="w-full justify-start space-x-4">
                    {item.icon}
                    <span>{item.label}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default Sidebar;