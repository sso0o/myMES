import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { DefectDistributionResponse } from '../types';

interface Props {
  data: DefectDistributionResponse[];
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

export function DefectDistributionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-5 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">불량 유형 분포</h3>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">기간 내 불량 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.defectType, value: d.qty }));

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 h-full">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">불량 유형 분포</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 12, border: '1px solid #e2e8f0' }}
            formatter={(value) => [`${value}개`, '수량']}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
