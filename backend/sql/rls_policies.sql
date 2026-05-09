-- 1. ADMIN 확인 헬퍼 함수
--    SECURITY DEFINER: RLS를 우회해 users 테이블을 직접 조회 (무한재귀 방지)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM users
    WHERE supabase_id = auth.uid()::text
      AND role = 'ADMIN'
      AND deleted_at IS NULL
      AND active = true
  );
$$;

-- 2. 각 테이블에 INSERT / UPDATE / DELETE 정책 추가
--    (SELECT 정책은 이전 스크립트에서 이미 추가됨)

DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'production_plans', 'work_orders', 'workers', 'quality_inspections',
    'process_equipment', 'item_processes', 'equipment', 'defect_records',
    'boms', 'bom_versions', 'processes', 'users',
    'common_codes', 'code_groups', 'items', 'production_records'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'CREATE POLICY admin_insert ON %I FOR INSERT TO authenticated WITH CHECK (is_admin())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY admin_update ON %I FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin())',
      tbl
    );
    EXECUTE format(
      'CREATE POLICY admin_delete ON %I FOR DELETE TO authenticated USING (is_admin())',
      tbl
    );
  END LOOP;
END;
$$;




-- =============================================
-- MES: 인증 사용자 조회 권한 RLS 정책
-- deleted_at IS NULL 조건 포함
-- =============================================
DO $$
DECLARE
  tbl text;
  tables text[] := ARRAY[
    'production_plans',
    'work_orders',
    'workers',
    'quality_inspections',
    'process_equipment',
    'item_processes',
    'equipment',
    'defect_records',
    'boms',
    'bom_versions',
    'processes',
    'users',
    'common_codes',
    'code_groups',
    'items',
    'production_records'
  ];
BEGIN
  FOREACH tbl IN ARRAY tables LOOP
    EXECUTE format(
      'ALTER POLICY authenticated_select ON public.%I TO authenticated USING (auth.role() = ''authenticated''::text AND deleted_at IS NULL)',
      tbl
    );
  END LOOP;
END;
$$;
