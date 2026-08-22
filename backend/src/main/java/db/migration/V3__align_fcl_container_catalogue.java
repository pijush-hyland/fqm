package db.migration;

import static db.migration.ContainerCatalogueMigrationSupport.CANONICAL_CODES;
import static db.migration.ContainerCatalogueMigrationSupport.MAPPED_CODES;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import java.util.Map;

import org.flywaydb.core.api.migration.BaseJavaMigration;
import org.flywaydb.core.api.migration.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import db.migration.ContainerCatalogueMigrationSupport.CanonicalOption;
import db.migration.ContainerCatalogueMigrationSupport.PreflightResult;

public class V3__align_fcl_container_catalogue extends BaseJavaMigration {

    private static final Logger LOG = LoggerFactory.getLogger(V3__align_fcl_container_catalogue.class);

    static final List<CanonicalOption> OPTIONS = List.of(
            option("20GP", "20 Standard", "5.895", "2.350", "2.392", "33.00", "2230", "28230", "30460", 1),
            option("40GP", "40 Standard", "12.029", "2.350", "2.392", "60.00", "3780", "27000", "32500", 2),
            option("20OT", "20 Open Top", null, null, null, "33.00", null, "27320", null, 3),
            option("40HC", "40 High Cube", "12.024", "2.350", "2.697", "67.00", "4020", "27000", "32500", 4),
            option("40OT", "40 Open Top High", null, null, null, "62.50", "3770", "28500", null, 5),
            option("20TK", "20 Feet Iso Tank", null, null, null, "24.00", "3800", "32200", "36000", 6));

    @Override
    public void migrate(Context context) throws Exception {
        Connection connection = context.getConnection();
        boolean originalAutoCommit = connection.getAutoCommit();
        connection.setAutoCommit(false);
        try {
            PreflightResult before = ContainerCatalogueMigrationSupport.preflight(connection, LOG);
            retireAllOptions(connection);
            for (CanonicalOption option : OPTIONS) {
                upsertCanonicalOption(connection, option);
            }
            assertPostflight(connection, before);
            connection.commit();
        } catch (SQLException | RuntimeException exception) {
            connection.rollback();
            throw exception;
        } finally {
            connection.setAutoCommit(originalAutoCommit);
        }
    }

    private static void retireAllOptions(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.executeUpdate("UPDATE container_types SET is_active = 0, display_order = NULL");
        }
    }

    private static void upsertCanonicalOption(Connection connection, CanonicalOption option) throws SQLException {
        try (PreparedStatement update = connection.prepareStatement("""
                UPDATE container_types
                SET name = ?, internal_length_meters = ?, internal_width_meters = ?, internal_height_meters = ?,
                    capacity_cbm = ?, tare_weight_kg = ?, maximum_cargo_weight_kg = ?,
                    maximum_total_weight_kg = ?, display_order = ?, is_active = 1, is_refrigerated = 0
                WHERE code = ?
                """)) {
            bindAuthoritativeValues(update, option);
            int updated = update.executeUpdate();
            if (updated == 0) {
                insertCanonicalOption(connection, option);
            }
        }
    }

    private static void insertCanonicalOption(Connection connection, CanonicalOption option) throws SQLException {
        if (!"20TK".equals(option.code())) {
            throw new IllegalStateException("Mapped canonical option disappeared during migration: " + option.code());
        }
        try (PreparedStatement insert = connection.prepareStatement("""
                INSERT INTO container_types
                    (code, name, description, length_meters, width_meters, height_meters, volumecbm,
                     max_gross_weight_kg, tare_weight_kg, max_payload_kg, is_active, is_refrigerated,
                     internal_length_meters, internal_width_meters, internal_height_meters,
                     capacity_cbm, maximum_cargo_weight_kg, maximum_total_weight_kg, display_order)
                 VALUES (?, ?, 'ISO tank container for liquid cargo', NULL, NULL, NULL, NULL, NULL, ?, NULL, 1, 0,
                    ?, ?, ?, ?, ?, ?, ?)
                """)) {
            insert.setString(1, option.code());
            insert.setString(2, option.name());
            insert.setBigDecimal(3, option.tareWeightKg());
            insert.setBigDecimal(4, option.internalLengthMeters());
            insert.setBigDecimal(5, option.internalWidthMeters());
            insert.setBigDecimal(6, option.internalHeightMeters());
            insert.setBigDecimal(7, option.capacityCbm());
            insert.setBigDecimal(8, option.maximumCargoWeightKg());
            insert.setBigDecimal(9, option.maximumTotalWeightKg());
            insert.setInt(10, option.displayOrder());
            insert.executeUpdate();
        }
    }

    private static void bindAuthoritativeValues(PreparedStatement statement, CanonicalOption option) throws SQLException {
        int index = 1;
        statement.setString(index++, option.name());
        statement.setBigDecimal(index++, option.internalLengthMeters());
        statement.setBigDecimal(index++, option.internalWidthMeters());
        statement.setBigDecimal(index++, option.internalHeightMeters());
        statement.setBigDecimal(index++, option.capacityCbm());
        statement.setBigDecimal(index++, option.tareWeightKg());
        statement.setBigDecimal(index++, option.maximumCargoWeightKg());
        statement.setBigDecimal(index++, option.maximumTotalWeightKg());
        statement.setInt(index++, option.displayOrder());
        statement.setString(index, option.code());
    }

    private static void assertPostflight(Connection connection, PreflightResult before) throws SQLException {
        if (ContainerCatalogueMigrationSupport.queryLong(connection,
                "SELECT COUNT(*) FROM container_types WHERE is_active = 1") != OPTIONS.size()) {
            throw new IllegalStateException("Postflight failed: expected exactly six active FCL Container Options");
        }
        for (CanonicalOption option : OPTIONS) {
            assertCanonicalOption(connection, option);
        }
        for (String code : MAPPED_CODES) {
            long currentId = ContainerCatalogueMigrationSupport.queryLong(connection,
                    "SELECT id FROM container_types WHERE code = ?", code);
            if (!before.ids().get(code).equals(currentId)) {
                throw new IllegalStateException("Postflight failed: mapped ID changed for " + code);
            }
        }
        Map<Long, Long> afterReferences = ContainerCatalogueMigrationSupport.referenceCounts(connection);
        for (Map.Entry<Long, Long> reference : before.referenceCounts().entrySet()) {
            if (!reference.getValue().equals(afterReferences.get(reference.getKey()))) {
                throw new IllegalStateException("Postflight failed: FCL references changed; before="
                        + before.describeReferences() + ", after=" + afterReferences);
            }
        }
        LOG.info("FCL catalogue postflight passed: active codes={}, stable mapped IDs={}, references={}",
                CANONICAL_CODES, MAPPED_CODES, afterReferences);
    }

    private static void assertCanonicalOption(Connection connection, CanonicalOption expected) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                SELECT name, internal_length_meters, internal_width_meters, internal_height_meters,
                    capacity_cbm, tare_weight_kg, maximum_cargo_weight_kg,
                    maximum_total_weight_kg, display_order, is_active
                FROM container_types WHERE code = ?
                """)) {
            statement.setString(1, expected.code());
            try (ResultSet row = statement.executeQuery()) {
                if (!row.next()
                        || !expected.name().equals(row.getString("name"))
                        || !same(expected.internalLengthMeters(), row.getBigDecimal("internal_length_meters"))
                        || !same(expected.internalWidthMeters(), row.getBigDecimal("internal_width_meters"))
                        || !same(expected.internalHeightMeters(), row.getBigDecimal("internal_height_meters"))
                        || !same(expected.capacityCbm(), row.getBigDecimal("capacity_cbm"))
                        || !same(expected.tareWeightKg(), row.getBigDecimal("tare_weight_kg"))
                        || !same(expected.maximumCargoWeightKg(), row.getBigDecimal("maximum_cargo_weight_kg"))
                        || !same(expected.maximumTotalWeightKg(), row.getBigDecimal("maximum_total_weight_kg"))
                        || expected.displayOrder() != row.getInt("display_order")
                        || !row.getBoolean("is_active")) {
                    throw new IllegalStateException("Postflight failed: authoritative values differ for " + expected.code());
                }
            }
        }
    }

    private static boolean same(BigDecimal expected, BigDecimal actual) {
        return expected == null ? actual == null : actual != null && expected.compareTo(actual) == 0;
    }

    private static CanonicalOption option(String code, String name, String length, String width, String height,
            String capacity, String tare, String cargo, String total, int order) {
        return new CanonicalOption(code, name, decimal(length), decimal(width), decimal(height), decimal(capacity),
                decimal(tare), decimal(cargo), decimal(total), order);
    }

    private static BigDecimal decimal(String value) {
        return value == null ? null : new BigDecimal(value);
    }
}