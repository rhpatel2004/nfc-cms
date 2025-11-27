'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, TrendingUp, Zap, Clock, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// --- Placeholder Data & Types ---
interface AnalyticsData {
  totalTaps: number;
  topPages: {
    tapCount: number;
    page: { name: string; slug: string };
  }[];
}
interface AnalyticStatCardProps {
  title: string;
  value: number | string | undefined; // Value can be a number (for toLocaleString) or a formatted string
  icon: React.ReactNode; // For the Lucide icon component
  description: string;
}

const placeholderData: AnalyticsData = {
    totalTaps: 12450,
    topPages: [
        { tapCount: 5200, page: { name: "Retail Promo A", slug: "retail-promo-a" } },
        { tapCount: 3100, page: { name: "Gym Membership", slug: "gym-membership" } },
        { tapCount: 1500, page: { name: "Museum Exhibit 4", slug: "museum-exhibit-4" } },
        { tapCount: 800, page: { name: "Product Info X", slug: "product-info-x" } },
    ],
};

// --- Custom Components ---

const AnalyticStatCard = ({ title, value, icon, description }: AnalyticStatCardProps) => (
  <Card className="hover:shadow-md transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold">{typeof value === 'number' ? value.toLocaleString() : value}</div>
      <p className="text-xs text-muted-foreground mt-1">{description}</p>
    </CardContent>
  </Card>
);

// --- Main Page Component ---
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  // Use useEffect to fetch data from the actual API route /api/analytics
  useEffect(() => {
    // 💡 NOTE: We are using placeholder data for the visual until the backend API is fully complete
    // const fetchAnalytics = async () => {
    //   const res = await fetch('/api/analytics');
    //   const data = await res.json();
    //   setData(data);
    //   setLoading(false);
    // };
    // fetchAnalytics();
    
    // Using placeholder for immediate visualization:
    setData(placeholderData);
    setLoading(false);
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Analytics...</div>;

  return (
    <div className="p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold flex items-center space-x-3">
        <BarChart className="h-7 w-7 text-blue-600" />
        <span>Real-time Engagement Analytics</span>
      </h1>
      <p className="text-slate-500">
        Monitor tap activity, page performance, and geographical data.
      </p>

      <Separator />

      {/* 1. KEY PERFORMANCE INDICATORS (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <AnalyticStatCard
          title="Total Taps Recorded"
          value={data?.totalTaps}
          icon={<Zap className="h-5 w-5 text-blue-500" />}
          description="Total physical taps across all registered NFC tags."
        />
        <AnalyticStatCard
          title="Avg. Taps / Tag"
          value={(data!.totalTaps / 25).toFixed(1)} // Placeholder calculation
          icon={<TrendingUp className="h-5 w-5 text-green-500" />}
          description="Average engagement per deployed NFC tag."
        />
        <AnalyticStatCard
          title="New Taps (Last 7 Days)"
          value={1500} // Placeholder
          icon={<Clock className="h-5 w-5 text-orange-500" />}
          description="Indicates recent campaign success."
        />
        <AnalyticStatCard
          title="Pages with Taps"
          value={data?.topPages.length}
          icon={<FileText className="h-5 w-5 text-purple-500" />}
          description="Number of unique pages that received traffic."
        />
      </div>

      {/* 2. CHART VISUALIZATION (Placeholder for Bar/Line Chart) */}
      <Card>
        <CardHeader>
          <CardTitle>Taps Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-b-lg">
          [Placeholder for a Line Chart showing daily tap volume]
        </CardContent>
      </Card>

      {/* 3. TOP PERFORMING PAGES (List) */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Performing Pages</CardTitle>
          <p className="text-sm text-muted-foreground">Highest tap counts since deployment.</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.topPages.map((page, index) => (
              <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                <span className="font-semibold text-lg">{index + 1}. {page.page.name}</span>
                <span className="text-xl font-bold text-blue-600">{page.tapCount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}