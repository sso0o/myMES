import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean

  // 이메일/비밀번호 로그인
  signIn: (email: string, password: string) => Promise<void>

  // 이메일/비밀번호 회원가입
  signUp: (email: string, password: string) => Promise<void>

  // 로그아웃
  signOut: () => Promise<void>

  // 세션 초기화 (앱 시작 시 호출)
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  loading: true,

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    set({ session: data.session, user: data.user })
  },

  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    set({ session: data.session, user: data.user ?? null })
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, user: null })
  },

  initialize: async () => {
    // 앱 시작 시 저장된 세션 복원
    const { data: { session } } = await supabase.auth.getSession()
    set({ session, user: session?.user ?? null, loading: false })

    // 세션 변경 이벤트 구독 (토큰 갱신, 로그아웃 등)
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ session, user: session?.user ?? null })
    })
  },
}))
