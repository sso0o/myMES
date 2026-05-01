package com.mymes.backend.bom.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;

@Component
@RequiredArgsConstructor
public class BomIndexConfig implements ApplicationRunner {

    private final JdbcTemplate jdbcTemplate;
    private final DataSource dataSource;

    /**
     * Soft delete된 BOM 행을 제외하고 활성 BOM만 중복 방지하는 PostgreSQL partial unique index를 생성합니다.
     *
     * @param args 애플리케이션 실행 인자
     */
    @Override
    public void run(ApplicationArguments args) throws SQLException {
        if (!isPostgreSql()) {
            return;
        }

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
