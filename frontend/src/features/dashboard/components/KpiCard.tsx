import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'orange';
  description?: string;
}

const colorMap = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100',
  red: 'bg-red-50 text-red-600 border-red-100',
  orange: 'bg-orange-50 text-orange-600 border-orange-100',
};

const iconBgMap = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  red: 'bg-red-100 text-red-600',
  orange: 'bg-orange-100 text-orange-600',
};

export function KpiCard({ title, value, unit, icon, color, description }: KpiCardProps) {
  return (
    <div className={cn('rounded-xl border p-5 flex items-center gap-4', colorMap[color])}>
      <div className={cn('rounded-full p-3 shrink-0', iconBgMap[color])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
        <p className="mt-1 text-2xl font-bold text-gray-900">
          {value}
          {unit && <span className="ml-1 text-base font-medium text-gray-500">{unit}</span>}
        </p>
        {description && <p className="mt-0.5 text-xs text-gray-400">{description}</p>}
      </div>
    </div>
  );
}
