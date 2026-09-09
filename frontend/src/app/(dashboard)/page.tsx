import { PageHeader } from '@/components/layout/PageHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { LiveCallFeed } from '@/components/dashboard/LiveCallFeed';
import { RecentAlerts } from '@/components/dashboard/RecentAlerts';
import { RiskDistribution } from '@/components/dashboard/RiskDistribution';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard — VoxGuard',
  description: 'Overview of system activity and alerts',
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full animate-in fade-in duration-300">
      <PageHeader 
        title="Dashboard" 
        description="Real-time overview of voice cloning detection activity."
      />
      
      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 min-h-[400px]">
          <LiveCallFeed />
        </div>
        <div className="min-h-[400px]">
          <RecentAlerts />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[350px]">
        <RiskDistribution />
        <ActivityTimeline />
      </div>
    </div>
  );
}
