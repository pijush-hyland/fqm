package com.freightquote.migration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
class ContainerCatalogueMigrationTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.44");

    @BeforeEach
    void createLegacyDatabase() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE IF EXISTS flyway_schema_history");
            statement.execute("DROP TABLE IF EXISTS fcl_freight_rates");
            statement.execute("DROP TABLE IF EXISTS courier_rates");
            statement.execute("DROP TABLE IF EXISTS container_types");
            statement.execute("DROP TABLE IF EXISTS locations");
            statement.execute("DROP TABLE IF EXISTS air_freight_rates");
            statement.execute("DROP TABLE IF EXISTS lcl_freight_rates");
            statement.execute("""
                    CREATE TABLE container_types (
                        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        code VARCHAR(10) NOT NULL UNIQUE,
                        name VARCHAR(255) NOT NULL,
                        description VARCHAR(255) NOT NULL,
                        length_meters DECIMAL(5,2) NOT NULL,
                        width_meters DECIMAL(5,2) NOT NULL,
                        height_meters DECIMAL(5,2) NOT NULL,
                        volumecbm DECIMAL(8,3) NOT NULL,
                        max_gross_weight_kg DECIMAL(8,2) NOT NULL,
                        tare_weight_kg DECIMAL(8,2) NOT NULL,
                        max_payload_kg DECIMAL(8,2) NOT NULL,
                        is_active BIT,
                        is_refrigerated BIT
                    )
                    """);
            statement.execute("""
                    CREATE TABLE courier_rates (
                        id BIGINT NOT NULL PRIMARY KEY
                    )
                    """);
            statement.execute("""
                    CREATE TABLE fcl_freight_rates (
                        id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                        rate DECIMAL(10,2) NOT NULL,
                        currency VARCHAR(3),
                        documentation_fee DECIMAL(10,2),
                        bunker_adjustment_rate DECIMAL(5,4),
                        description VARCHAR(500),
                        container_type_id BIGINT,
                        terminal_handling_charge DECIMAL(10,2),
                        courier_rate_id BIGINT,
                        CONSTRAINT fk_test_container_type FOREIGN KEY (container_type_id)
                            REFERENCES container_types(id),
                        CONSTRAINT fk_test_courier_rate FOREIGN KEY (courier_rate_id)
                            REFERENCES courier_rates(id)
                    )
                    """);
            insertLegacyOptions(statement);
            statement.execute("INSERT INTO courier_rates (id) VALUES (7001), (7002), (7003)");
            statement.execute("""
                    INSERT INTO fcl_freight_rates
                        (id, rate, currency, documentation_fee, bunker_adjustment_rate,
                         description, container_type_id, terminal_handling_charge, courier_rate_id)
                    VALUES
                        (501, 1234.56, 'USD', 12.34, 0.0250, 'mapped rate', 101, 45.67, 7001),
                        (502, 2345.67, 'EUR', 23.45, 0.0350, 'retired rate', 106, 56.78, 7002),
                        (503, 3456.78, 'INR', 34.56, 0.0450, 'custom rate', 111, 67.89, 7003)
                    """);
        }
    }

    @Test
    void migratesRepresentativeExistingDatabaseWithoutChangingHistoricalReferences() throws SQLException {
        Flyway flyway = flyway();

        assertThat(flyway.migrate().migrationsExecuted).isEqualTo(4);

        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            assertThat(readActiveOptions(statement)).containsExactly(
                    "101|20GP|20 Standard|5.895|2.350|2.392|33.00|2230.00|28230.00|30460.00|1",
                    "102|40GP|40 Standard|12.029|2.350|2.392|60.00|3780.00|27000.00|32500.00|2",
                    "103|20OT|20 Open Top|null|null|null|33.00|null|27320.00|null|3",
                    "104|40HC|40 High Cube|12.024|2.350|2.697|67.00|4020.00|27000.00|32500.00|4",
                    "105|40OT|40 Open Top High|null|null|null|62.50|3770.00|28500.00|null|5",
                    "113|20TK|20 Feet Iso Tank|null|null|null|24.00|3800.00|32200.00|36000.00|6");
            assertThat(readSingle(statement, "SELECT COUNT(*) FROM container_types WHERE is_active = 0"))
                    .isEqualTo("7");
            assertThat(readSingle(statement, """
                    SELECT GROUP_CONCAT(
                        CONCAT(id, '|', container_type_id, '|', rate, '|', currency, '|', documentation_fee,
                            '|', bunker_adjustment_rate, '|', terminal_handling_charge, '|', courier_rate_id)
                        ORDER BY id SEPARATOR ';')
                    FROM fcl_freight_rates
                    """))
                    .isEqualTo("501|101|1234.56|USD|12.34|0.0250|45.67|7001;"
                            + "502|106|2345.67|EUR|23.45|0.0350|56.78|7002;"
                            + "503|111|3456.78|INR|34.56|0.0450|67.89|7003");
            assertThat(readSingle(statement, """
                    SELECT COUNT(*) FROM information_schema.referential_constraints
                    WHERE constraint_schema = DATABASE()
                        AND table_name = 'fcl_freight_rates'
                    """))
                    .isEqualTo("2");
            assertThat(readSingle(statement, """
                    SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema = DATABASE() AND table_name = 'container_types'
                        AND column_name IN ('length_meters', 'width_meters', 'height_meters',
                            'volumecbm', 'max_gross_weight_kg', 'max_payload_kg')
                    """))
                    .isEqualTo("0");
                    assertThatThrownBy(() -> statement.execute("""
                        UPDATE container_types
                        SET internal_length_meters = NULL
                        WHERE code = '20GP'
                        """))
                        .isInstanceOf(SQLException.class);
        }

        assertThat(flyway.migrate().migrationsExecuted).isZero();
    }

    @Test
    void blocksMalformedCodesBeforeChangingTheSchemaOrCatalogue() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("UPDATE container_types SET code = ' bad ' WHERE id = 111");
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseMessage("Container catalogue preflight blocked: malformed code:  bad ");

        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            assertThat(readSingle(statement, """
                    SELECT COUNT(*) FROM information_schema.columns
                    WHERE table_schema = DATABASE() AND table_name = 'container_types'
                        AND column_name = 'capacity_cbm'
                    """))
                    .isEqualTo("0");
            assertThat(readSingle(statement, "SELECT name FROM container_types WHERE id = 101"))
                    .isEqualTo("legacy 20GP");
        }
    }

    @Test
    void blocksDuplicateAndAmbiguousCanonicalCodes() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE container_types DROP INDEX code");
            statement.execute("ALTER TABLE container_types MODIFY code VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL");
            statement.execute("""
                    INSERT INTO container_types
                        (code, name, description, length_meters, width_meters, height_meters,
                         volumecbm, max_gross_weight_kg, tare_weight_kg, max_payload_kg,
                         is_active, is_refrigerated)
                    SELECT '20gp', name, description, length_meters, width_meters, height_meters,
                        volumecbm, max_gross_weight_kg, tare_weight_kg, max_payload_kg,
                        is_active, is_refrigerated
                    FROM container_types WHERE code = '20GP'
                    """);
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseInstanceOf(IllegalStateException.class)
                .hasStackTraceContaining("duplicate or ambiguous canonical code: 20GP");
    }

    @Test
    void blocksMissingMappedCodes() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DELETE FROM container_types WHERE code = '40GP'");
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseMessage("Container catalogue preflight blocked: missing canonical code: 40GP");
    }

    @Test
    void blocksPartialInternalDimensions() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE container_types MODIFY length_meters DECIMAL(5,2) NULL");
            statement.execute("UPDATE container_types SET length_meters = NULL WHERE code = '40GP'");
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseMessage("Container catalogue preflight blocked: partial Internal Dimensions for code: 40GP");
    }

    @Test
    void blocksBrokenContainerReferences() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE fcl_freight_rates DROP FOREIGN KEY fk_test_container_type");
            statement.execute("UPDATE fcl_freight_rates SET container_type_id = 999999 WHERE id = 501");
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseMessage("Container catalogue preflight blocked: broken FCL rate reference: 501");
    }

    @Test
    void rollsBackEveryCatalogueChangeWhenTheDataPhaseFails() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("ALTER TABLE container_types ADD CONSTRAINT forced_unique_name UNIQUE (name)");
            statement.execute("UPDATE container_types SET name = '20 Feet Iso Tank' WHERE id = 111");
        }

        assertThatThrownBy(() -> flyway().migrate())
                .hasRootCauseInstanceOf(SQLException.class)
                .hasStackTraceContaining("Duplicate entry");

        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            assertThat(readSingle(statement, "SELECT name FROM container_types WHERE id = 101"))
                    .isEqualTo("legacy 20GP");
            assertThat(readSingle(statement, "SELECT COUNT(*) FROM container_types WHERE code = '20TK'"))
                    .isEqualTo("0");
            assertThat(readSingle(statement, "SELECT COUNT(*) FROM container_types WHERE is_active = 1"))
                    .isEqualTo("12");
        }
    }

    @Test
    void bootstrapsAnEmptyDatabaseThroughTheVersionZeroBaseline() throws SQLException {
        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            statement.execute("DROP TABLE fcl_freight_rates");
            statement.execute("DROP TABLE IF EXISTS courier_rates");
            statement.execute("DROP TABLE container_types");
            statement.execute("DROP TABLE IF EXISTS locations");
            statement.execute("DROP TABLE IF EXISTS air_freight_rates");
            statement.execute("DROP TABLE IF EXISTS lcl_freight_rates");
        }

        assertThat(flyway().migrate().migrationsExecuted).isEqualTo(5);

        try (Connection connection = connection(); Statement statement = connection.createStatement()) {
            assertThat(readSingle(statement, "SELECT COUNT(*) FROM container_types WHERE is_active = 1"))
                    .isEqualTo("6");
            assertThat(readSingle(statement, "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE()"))
                    .isEqualTo("7");
        }
    }

    private Flyway flyway() {
        return Flyway.configure()
                .dataSource(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword())
                .baselineOnMigrate(true)
                .baselineVersion("0")
                .load();
    }

    private Connection connection() throws SQLException {
        return DriverManager.getConnection(MYSQL.getJdbcUrl(), MYSQL.getUsername(), MYSQL.getPassword());
    }

    private static void insertLegacyOptions(Statement statement) throws SQLException {
        statement.execute("""
                INSERT INTO container_types
                    (id, code, name, description, length_meters, width_meters, height_meters,
                     volumecbm, max_gross_weight_kg, tare_weight_kg, max_payload_kg,
                     is_active, is_refrigerated)
                VALUES
                    (101, '20GP', 'legacy 20GP', 'legacy', 5.90, 2.35, 2.39, 33, 30480, 2230, 28250, 1, 0),
                    (102, '40GP', 'legacy 40GP', 'legacy', 12.03, 2.35, 2.39, 67, 30480, 3740, 26740, 1, 0),
                    (103, '20OT', 'legacy 20OT', 'legacy', 5.90, 2.35, 2.39, 33, 30480, 2300, 28180, 1, 0),
                    (104, '40HC', 'legacy 40HC', 'legacy', 12.03, 2.35, 2.69, 76, 30480, 3740, 26740, 1, 0),
                    (105, '40OT', 'legacy 40OT', 'legacy', 12.03, 2.35, 2.39, 67, 30480, 3900, 26580, 1, 0),
                    (106, '20HC', 'legacy 20HC', 'legacy', 5.90, 2.35, 2.69, 37, 30480, 2230, 28250, 1, 0),
                    (107, '20RF', 'legacy 20RF', 'legacy', 5.44, 2.29, 2.27, 28, 30480, 3080, 27400, 1, 1),
                    (108, '40RF', 'legacy 40RF', 'legacy', 11.56, 2.29, 2.27, 60, 30480, 4800, 25680, 1, 1),
                    (109, '40RH', 'legacy 40RH', 'legacy', 11.56, 2.29, 2.57, 68, 30480, 4800, 25680, 1, 1),
                    (110, '20FR', 'legacy 20FR', 'legacy', 5.90, 2.35, 2.39, 33, 45000, 2360, 42640, 1, 0),
                    (111, 'CSTM', 'custom', 'custom option', 1, 1, 1, 1, 2, 1, 1, 1, 0),
                    (112, '40FR', 'legacy 40FR', 'legacy', 12.03, 2.35, 2.39, 67, 45000, 5000, 40000, 1, 0)
                """);
    }

    private static List<String> readActiveOptions(Statement statement) throws SQLException {
        try (ResultSet rows = statement.executeQuery("""
                SELECT id, code, name, internal_length_meters, internal_width_meters,
                    internal_height_meters, capacity_cbm, tare_weight_kg,
                    maximum_cargo_weight_kg, maximum_total_weight_kg, display_order
                FROM container_types WHERE is_active = 1 ORDER BY display_order
                """)) {
            java.util.ArrayList<String> values = new java.util.ArrayList<>();
            while (rows.next()) {
                values.add(String.join("|",
                        rows.getString("id"), rows.getString("code"), rows.getString("name"),
                        decimal(rows, "internal_length_meters"), decimal(rows, "internal_width_meters"),
                        decimal(rows, "internal_height_meters"), decimal(rows, "capacity_cbm"),
                        decimal(rows, "tare_weight_kg"), decimal(rows, "maximum_cargo_weight_kg"),
                        decimal(rows, "maximum_total_weight_kg"), rows.getString("display_order")));
            }
            return values;
        }
    }

    private static String decimal(ResultSet rows, String column) throws SQLException {
        BigDecimal value = rows.getBigDecimal(column);
        return value == null ? "null" : value.toPlainString();
    }

    private static String readSingle(Statement statement, String sql) throws SQLException {
        try (ResultSet result = statement.executeQuery(sql)) {
            assertThat(result.next()).isTrue();
            return result.getString(1);
        }
    }
}