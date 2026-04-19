import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseSupabaseRealtimeOptions<T extends Record<string, unknown>> {
  /** 구독할 테이블 이름 (예: 'work_orders') */
  table: string
  /** 구독할 이벤트 종류 */
  event?: PostgresChangeEvent
  /** 변경 발생 시 호출되는 콜백 */
  onchange: (payload: RealtimePostgresChangesPayload<T>) => void
}

/**
 * Supabase Realtime을 이용해 PostgreSQL 테이블 변경사항을 실시간으로 구독합니다.
 *
 * 사용 예 (작업지시 실시간 업데이트):
 *   useSupabaseRealtime({
 *     table: 'work_orders',
 *     event: '*',
 *     onchange: (payload) => {
 *       console.log('작업지시 변경:', payload)
 *       refetchWorkOrders()
 *     }
 *   })
 *
 * ⚠️ Supabase 대시보드에서 해당 테이블의 Replication을 활성화해야 합니다.
 * (Table Editor → 해당 테이블 → Replication → Enable)
 */
export function useSupabaseRealtime<T extends Record<string, unknown>>({
  table,
  event = '*',
  onchange,
}: UseSupabaseRealtimeOptions<T>) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        (payload) => onchange(payload as RealtimePostgresChangesPayload<T>)
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, onchange])
}
