import { useEffect } from 'react'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type PostgresChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseSupabaseRealtimeOptions<T extends Record<string, unknown>> {
  table: string
  event?: PostgresChangeEvent
  onchange: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useSupabaseRealtime<T extends Record<string, unknown>>({
  table,
  event = '*',
  onchange,
}: UseSupabaseRealtimeOptions<T>) {
  useEffect(() => {
    const channel = supabase
      .channel(`realtime:${table}`)
      .on('postgres_changes', { event, schema: 'public', table }, (payload) =>
        onchange(payload as RealtimePostgresChangesPayload<T>),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, onchange])
}
