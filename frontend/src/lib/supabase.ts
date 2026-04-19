import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY 환경변수가 설정되지 않았습니다.')
}

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
