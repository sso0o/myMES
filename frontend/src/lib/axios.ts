// src/lib/axios.ts
import axios from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
    baseURL: "/api",
    withCredentials: true,
});

/**
 * 요청 인터셉터: Supabase 세션 토큰을 Authorization 헤더에 자동으로 첨부합니다.
 * Spring Boot 백엔드의 SupabaseJwtFilter가 이 토큰을 검증합니다.
 */
api.interceptors.request.use(async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
});

/**
 * 응답 인터셉터: 401 응답 시 로그인 페이지로 리다이렉트
 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            await supabase.auth.signOut();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);