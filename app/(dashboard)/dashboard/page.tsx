'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag, FileText, Users, Scan, Link, Ban } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// Interface for the fetched statistics data
interface DashboardStats {
  user: { total: number };
  page: { total: number; live: number; draft: number };
  tag: { total: number; registered: number; unregistered: number; assigned: number; unassigned: number };
}


interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  badgeText?: string; // Badge text is optional
  badgeVariant: "default" | "secondary" | "destructive" | "outline"; // Use the specific Shadcn Badge variants
}

// Custom Stat Card Component
const StatCard = ({ title, value, icon, badgeText, badgeVariant }: StatCardProps) => (
  <Card className="hover:shadow-lg transition-shadow duration-300">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {badgeText && (
        <Badge variant={badgeVariant} className="mt-2 text-xs">
          {badgeText}
        </Badge>
      )}
    </CardContent>
  </Card>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data.');
        }
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (err) {
        setError('Could not load dashboard data. Check the server connection.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Dashboard Data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  if (!stats) return null; // Should not happen if data fetched successfully

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">CMS Dashboard Overview</h1>

      {/* Grid of Main Indicators */}
      {/* 💡 RESPONSIVE: Uses grid layout that adapts from 1 to 4 columns */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total User Accounts"
          value={stats.user.total}
          icon={<Users className="h-4 w-4 text-slate-500" />}
          badgeText="User Count"
          badgeVariant="default"
        />
        <StatCard
          title="Total Tags Created"
          value={stats.tag.total}
          icon={<Tag className="h-4 w-4 text-slate-500" />}
          badgeText={`${stats.tag.registered} Registered`}
          badgeVariant="outline"
        />
        <StatCard
          title="Total Content Pages"
          value={stats.page.total}
          icon={<FileText className="h-4 w-4 text-slate-500" />}
          badgeText={`${stats.page.live} Live`}
          badgeVariant="default"
        />
        <StatCard
          title="Total Assignments"
          value={stats.tag.assigned}
          icon={<Link className="h-4 w-4 text-slate-500" />}
          badgeText={`${stats.tag.unassigned} Unassigned`}
          badgeVariant={stats.tag.unassigned > 0 ? "destructive" : "secondary"}
        />
      </div>

      <Separator />

      {/* Detailed Tag Statuses */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Tag Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Registered Cards"
              value={stats.tag.registered}
              icon={<Scan className="h-4 w-4 text-green-500" />}
              badgeText={`Used: ${stats.tag.assigned}`}
              badgeVariant="outline"
            />
            <StatCard
              title="Unregistered Cards (Ready to Tap)"
              value={stats.tag.unregistered}
              icon={<Scan className="h-4 w-4 text-red-500" />}
              badgeText={`Remaining: ${stats.tag.unregistered}`}
              badgeVariant="secondary"
            />
            <StatCard
              title="Tags Lacking Content"
              value={stats.tag.unassigned}
              icon={<Ban className="h-4 w-4 text-orange-500" />}
              badgeText={`Needs Assignment`}
              badgeVariant="destructive"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}