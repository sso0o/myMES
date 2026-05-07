import { useState } from 'react';
import { ClipboardList, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';
import { KpiCard } from '@/common/components/KpiCard';
import { WorkOrderStatusChart } from '@/features/dashboard/components/WorkOrderStatusChart';
import { ProductionTrendChart } from '@/features/dashboard/components/ProductionTrendChart';
import { DefectDistributionChart } from '@/features/dashboard/components/DefectDistributionChart';
import { IssueList } from '@/features/dashboard/components/IssueList';
import {
  useDashboardSummary,
  useWorkOrderStatus,
  useProductionTrend,
  useDefectDistribution,
  useDashboardIssues,
  useDashboardRealtime,
} from '@/features/dashboard/hooks/useDashboardQuery';
import type { DashboardPeriod } from '@/features/dashboard/types';

const PERIOD_OPTIONS: { label: string; value: DashboardPeriod }[] = [
  { label: '오늘', value: 'TODAY' },
  { label: '이번 주', value: 'WEEK' },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('TODAY');

  useDashboardRealtime();

  const { data: summary } = useDashboardSummary(period);
  const { data: workOrderStatus = [] } = useWorkOrderStatus(period);
  const { data: productionTrend = [] } = useProductionTrend(period);
  const { data: defectDistribution = [] } = useDefectDistribution(period);
  const { data: issues = [] } = useDashboardIssues();

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">대시보드</h1>
          <p className="mt-0.5 text-sm text-gray-500">공장 현황을 실시간으로 확인합니다.</p>
        </div>
        {/* 기간 필터 */}
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-4 py-1.5 text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 카드 */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard
          title="작업지시"
          value={summary?.totalWorkOrders ?? 0}
          unit="건"
          icon={<ClipboardList size={20} />}
          color="blue"
          description={`완료 ${summary?.completedWorkOrders ?? 0}건`}
        />
        <KpiCard
          title="완료율"
          value={summary?.completionRate ?? 0}
          unit="%"
          icon={<CheckCircle2 size={20} />}
          color="green"
        />
        <KpiCard
          title="불량률"
          value={summary?.defectRate ?? 0}
          unit="%"
          icon={<AlertCircle size={20} />}
          color="red"
        />
        <KpiCard
          title="설비가동률"
          value={summary?.equipmentUtilizationRate ?? 0}
          unit="%"
          icon={<Cpu size={20} />}
          color="orange"
        />
      </div>

      {/* 차트 상단 행 */}
      <div className="grid grid-cols-2 gap-4">
        <WorkOrderStatusChart data={workOrderStatus} />
        <ProductionTrendChart data={productionTrend} period={period} />
      </div>

      {/* 차트 하단 행 */}
      <div className="grid grid-cols-2 gap-4">
        <DefectDistributionChart data={defectDistribution} />
        <IssueList data={issues} />
      </div>
    </div>
  );
}
