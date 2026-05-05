import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import type { ProductionTrendResponse } from '../types';
import type { DashboardPeriod } from '../types';

interface Props {
  data: ProductionTrendResponse[];
  period: DashboardPeriod;
}

export function ProductionTrendChart({ data, period }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        생산량 추이 ({period === 'TODAY' ? '시간별' : '일별'})
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
            interval={period === 'TODAY' ? 3 : 0}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
            formatter={(value) => [`${value}개`, '완성수량']}
          />
          <Line
            type="monotone"
            dataKey="completedQty"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
