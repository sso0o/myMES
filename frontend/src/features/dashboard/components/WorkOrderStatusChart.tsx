import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { WorkOrderStatusCountResponse } from '../types';

interface Props {
  data: WorkOrderStatusCountResponse[];
}

const STATUS_LABEL: Record<string, string> = {
  WAITING: '대기',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
};

const STATUS_COLOR: Record<string, string> = {
  WAITING: '#94a3b8',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
};

export function WorkOrderStatusChart({ data }: Props) {
  const chartData = data.map((d) => ({
    name: STATUS_LABEL[d.status] ?? d.status,
    count: d.count,
    status: d.status,
  }));

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">작업지시 현황</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
            formatter={(value) => [`${value}건`, '수량']}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
