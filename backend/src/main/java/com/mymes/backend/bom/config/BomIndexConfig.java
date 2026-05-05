package com.mymes.backend.bom.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "mymes.bom-migration", name = "enabled", havingValue = "true")
@RequiredArgsConstructor
public class BomIndexConfig implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    /**
     * BOM 버전 마이그레이션 및 partial unique index를 생성합니다.
     * bom_version_id가 없는 기존 데이터를 bom_versions 테이블과 연결한 후 NOT NULL 제약을 적용합니다.
     *
     * @param args 애플리케이션 실행 인자
     */
    @Override
    public void run(ApplicationArguments args) throws SQLException {
        if (!isPostgreSql()) {
            return;
        }

        migrateExistingBomsToVersions();
        enforceNotNull();
        createIndexes();
    }

    /**
     * bom_version_id가 없는 기존 boms 행을 bom_versions 테이블과 연결합니다.
     * 활성(deleted_at IS NULL) boms → parent_item_id별 ACTIVE 버전 1 생성
     * 삭제된(deleted_at IS NOT NULL) boms → 가장 가까운 버전에 연결 (없으면 INACTIVE 버전 생성)
     */
    private void migrateExistingBomsToVersions() {
        log.info("BOM 버전 마이그레이션 시작");

        // 활성 boms: parent_item_id별로 ACTIVE BomVersion(v1) 생성 후 연결
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    r RECORD;
                    v_id bigint;
                BEGIN
                    FOR r IN
                        SELECT DISTINCT parent_item_id FROM boms
                        WHERE deleted_at IS NULL AND bom_version_id IS NULL
                    LOOP
                        INSERT INTO bom_versions (parent_item_id, version_no, status, created_at, updated_at)
                        VALUES (r.parent_item_id, 1, 'ACTIVE', NOW(), NOW())
                        RETURNING id INTO v_id;

                        UPDATE boms
                        SET bom_version_id = v_id
                        WHERE parent_item_id = r.parent_item_id
                          AND deleted_at IS NULL
                          AND bom_version_id IS NULL;
                    END LOOP;
                END $$
                """);

        // 삭제된 boms: parent_item_id별로 기존 버전에 연결하거나 INACTIVE 버전 생성 후 연결
        jdbcTemplate.execute("""
                DO $$
                DECLARE
                    r RECORD;
                    v_id bigint;
                BEGIN
                    FOR r IN
                        SELECT DISTINCT parent_item_id FROM boms
                        WHERE deleted_at IS NOT NULL AND bom_version_id IS NULL
                    LOOP
                        SELECT id INTO v_id
                        FROM bom_versions
                        WHERE parent_item_id = r.parent_item_id
                        LIMIT 1;

                        IF v_id IS NULL THEN
                            INSERT INTO bom_versions (parent_item_id, version_no, status, created_at, updated_at)
                            VALUES (r.parent_item_id, 1, 'INACTIVE', NOW(), NOW())
                            RETURNING id INTO v_id;
                        END IF;

                        UPDATE boms
                        SET bom_version_id = v_id
                        WHERE parent_item_id = r.parent_item_id
                          AND deleted_at IS NOT NULL
                          AND bom_version_id IS NULL;
                    END LOOP;
                END $$
                """);

        log.info("BOM 버전 마이그레이션 완료");
    }

    /**
     * 마이그레이션 완료 후 bom_version_id에 NOT NULL 제약을 적용합니다.
     * 이미 NOT NULL인 경우 PostgreSQL이 무시하므로 멱등 실행 가능합니다.
     */
    private void enforceNotNull() {
        Boolean hasNull = jdbcTemplate.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM boms WHERE bom_version_id IS NULL)",
                Boolean.class
        );
        if (Boolean.FALSE.equals(hasNull)) {
            jdbcTemplate.execute("ALTER TABLE boms ALTER COLUMN bom_version_id SET NOT NULL");
        }
    }

    /**
     * Soft delete된 BOM 행을 제외하고 활성 BOM만 중복 방지하는 partial unique index를 생성합니다.
     */
    private void createIndexes() {
        jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS ux_boms_parent_material_active
                ON boms(parent_item_id, material_item_id)
                WHERE deleted_at IS NULL
                """);
        jdbcTemplate.execute("""
                CREATE UNIQUE INDEX IF NOT EXISTS ux_boms_parent_sequence_active
                ON boms(parent_item_id, sequence)
                WHERE deleted_at IS NULL
                """);
    }

    private boolean isPostgreSql() throws SQLException {
        try (Connection connection = dataSource.getConnection()) {
            return "PostgreSQL".equalsIgnoreCase(connection.getMetaData().getDatabaseProductName());
        }
    }
}
