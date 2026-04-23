import { createClient } from '@supabase/supabase-js'
import { getRequiredEnv } from './config'

const supabaseUrl = getRequiredEnv('VITE_SUPABASE_URL')
const supabaseAnonKey = getRequiredEnv('VITE_SUPABASE_ANON_KEY')

/**
 * Supabase 클라이언트 인스턴스
 * - Auth: 로그인/로그아웃/회원가입
 * - DB: PostgreSQL 직접 쿼리 (선택적으로 사용)
 * - Realtime: 실시간 데이터 구독
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 로그인 상태를 localStorage에 자동 저장
    persistSession: true,
    autoRefreshToken: true,
  },
})
