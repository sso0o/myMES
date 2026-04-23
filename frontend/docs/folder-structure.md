# 폴더 구조

**기능 기준(Feature-first)** 구조를 사용합니다.

```
src/
├── features/             # 도메인별 기능 모음
│   ├── workorder/        # 작업 지시
│   │   ├── components/   # 해당 도메인 전용 컴포넌트
│   │   ├── hooks/        # 해당 도메인 전용 훅
│   │   └── types/        # 해당 도메인 타입 정의
│   ├── production/       # 생산 실적
│   ├── planning/         # 생산 계획
│   ├── quality/          # 품질
│   └── equipment/        # 설비
├── common/
│   ├── components/       # 공통 UI 컴포넌트 (Button, Modal, Table 등)
│   └── hooks/            # 공통 훅
├── pages/                # 라우트 단위 페이지 컴포넌트
├── store/                # Zustand 전역 상태
├── lib/                  # axios, supabase 등 외부 라이브러리 설정
├── router/               # 라우터 설정 및 인증 가드
└── types/                # 전역 공통 타입 정의
```

**규칙**
- 새 기능은 반드시 `features/{도메인}/` 안에 위치시킵니다.
- 두 도메인 이상에서 사용하는 컴포넌트/훅은 `common/`으로 분리합니다.
- `lib/`에는 외부 라이브러리 초기화·설정 코드만 둡니다.
