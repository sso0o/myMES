import { AlertTriangle } from 'lucide-react';
import type { DashboardIssueResponse } from '../types';

interface Props {
  data: DashboardIssueResponse[];
}

const STATUS_LABEL: Record<string, string> = {
  WAITING: '대기',
  IN_PROGRESS: '진행 중',
};

const STATUS_CLASS: Record<string, string> = {
  WAITING: 'bg-gray-100 text-gray-600',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
};

export function IssueList({ data }: Props) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={16} className="text-red-500" />
        <h3 className="text-sm font-semibold text-gray-700">지연/이슈 작업지시</h3>
        {data.length > 0 && (
          <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
            {data.length}건
          </span>
        )}
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-400">이슈 작업지시가 없습니다.</p>
        </div>
      ) : (
        <ul className="space-y-2 overflow-y-auto">
          {data.map((issue) => (
            <li
              key={issue.workOrderId}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">{issue.workOrderNo}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${STATUS_CLASS[issue.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABEL[issue.status] ?? issue.status}
                  </span>
                </div>
                <p className="mt-0.5 text-sm font-medium text-gray-800 truncate">{issue.itemName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-400">납기</p>
                <p className="text-xs font-semibold text-red-600">{issue.dueDate}</p>
                {issue.daysOverdue > 0 && (
                  <p className="text-xs text-red-500">+{issue.daysOverdue}일</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
