package db.migration;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.slf4j.Logger;

final class ContainerCatalogueMigrationSupport {

    static final Set<String> MAPPED_CODES = Set.of("20GP", "40GP", "20OT", "40HC", "40OT");
    static final Set<String> CANONICAL_CODES = Set.of("20GP", "40GP", "20OT", "40HC", "40OT", "20TK");
    static final Set<String> KNOWN_RETIRED_CODES = Set.of("20HC", "20RF", "40RF", "40RH", "20FR", "40FR");

    private ContainerCatalogueMigrationSupport() {
    }

    static PreflightResult preflight(Connection connection, Logger log) throws SQLException {
        List<String> conflicts = new ArrayList<>();
        requireTable(connection, "container_types", conflicts);
        requireTable(connection, "fcl_freight_rates", conflicts);
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Container catalogue preflight blocked: " + String.join("; ", conflicts));
        }

        addQueryValues(connection, conflicts, """
                SELECT CONCAT('malformed code: ', COALESCE(code, '<null>'))
                FROM container_types
                WHERE code IS NULL OR BINARY code <> BINARY UPPER(TRIM(code))
                    OR code NOT REGEXP '^[A-Z0-9]{2,10}$'
                """);
        addQueryValues(connection, conflicts, """
            SELECT CONCAT('duplicate or ambiguous canonical code: ', MIN(UPPER(TRIM(code))))
                FROM container_types
                WHERE UPPER(TRIM(code)) IN ('20GP','40GP','20OT','40HC','40OT','20TK')
                GROUP BY UPPER(TRIM(code)) HAVING COUNT(*) > 1
                """);
        addQueryValues(connection, conflicts, """
            SELECT CONCAT('duplicate code: ', MIN(code))
                FROM container_types
                GROUP BY BINARY code HAVING COUNT(*) > 1
                """);
        for (String code : MAPPED_CODES) {
            if (queryLong(connection, "SELECT COUNT(*) FROM container_types WHERE code = ?", code) != 1) {
                conflicts.add("missing canonical code: " + code);
            }
        }

        String dimensionPrefix = columnExists(connection, "container_types", "internal_length_meters")
                ? "internal_"
                : "";
        addQueryValues(connection, conflicts, """
                SELECT CONCAT('partial Internal Dimensions for code: ', code)
                FROM container_types
                WHERE ((%1$slength_meters IS NULL) + (%1$swidth_meters IS NULL)
                    + (%1$sheight_meters IS NULL)) IN (1, 2)
                """.formatted(dimensionPrefix));
        addQueryValues(connection, conflicts, """
                SELECT CONCAT('broken FCL rate reference: ', f.id)
                FROM fcl_freight_rates f
                LEFT JOIN container_types c ON c.id = f.container_type_id
                WHERE c.id IS NULL
                """);

        validateCanonicalSource(conflicts);

        Map<String, Long> ids = new LinkedHashMap<>();
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery("SELECT code, id FROM container_types ORDER BY id")) {
            while (rows.next()) {
                ids.put(rows.getString("code"), rows.getLong("id"));
            }
        }

        Map<Long, Long> referenceCounts = referenceCounts(connection);
        List<String> matches = ids.keySet().stream().filter(CANONICAL_CODES::contains).toList();
        List<String> knownRetirements = ids.keySet().stream().filter(KNOWN_RETIRED_CODES::contains).toList();
        List<String> customRetirements = ids.keySet().stream()
                .filter(code -> !CANONICAL_CODES.contains(code) && !KNOWN_RETIRED_CODES.contains(code))
                .toList();
        log.info("FCL catalogue preflight: canonical matches={}, required inserts={}, known retirements={}, custom retirements={}, references={}",
                matches, ids.containsKey("20TK") ? List.of() : List.of("20TK"), knownRetirements,
                customRetirements, referenceCounts);
        if (!conflicts.isEmpty()) {
            log.error("FCL catalogue preflight blocking conflicts={}", conflicts);
            throw new IllegalStateException("Container catalogue preflight blocked: " + String.join("; ", conflicts));
        }
        return new PreflightResult(ids, referenceCounts);
    }

    static Map<Long, Long> referenceCounts(Connection connection) throws SQLException {
        Map<Long, Long> counts = new LinkedHashMap<>();
        try (Statement statement = connection.createStatement();
                ResultSet rows = statement.executeQuery("""
                        SELECT c.id, COUNT(f.id)
                        FROM container_types c
                        LEFT JOIN fcl_freight_rates f ON f.container_type_id = c.id
                        GROUP BY c.id ORDER BY c.id
                        """)) {
            while (rows.next()) {
                counts.put(rows.getLong(1), rows.getLong(2));
            }
        }
        return counts;
    }

    static long queryLong(Connection connection, String sql, Object... parameters) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement(sql)) {
            for (int index = 0; index < parameters.length; index++) {
                statement.setObject(index + 1, parameters[index]);
            }
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getLong(1);
            }
        }
    }

    private static void validateCanonicalSource(List<String> conflicts) {
        Set<String> codes = new java.util.HashSet<>();
        Set<Integer> displayOrders = new java.util.HashSet<>();
        for (CanonicalOption option : V3__align_fcl_container_catalogue.OPTIONS) {
            boolean dimensionsComplete = option.internalLengthMeters() == null
                    && option.internalWidthMeters() == null
                    && option.internalHeightMeters() == null
                    || option.internalLengthMeters() != null
                    && option.internalWidthMeters() != null
                    && option.internalHeightMeters() != null;
                    boolean dimensionsPositive = option.internalLengthMeters() == null
                        || positive(option.internalLengthMeters())
                        && positive(option.internalWidthMeters())
                        && positive(option.internalHeightMeters());
                    if (!codes.add(option.code()) || !displayOrders.add(option.displayOrder())
                        || !dimensionsComplete || !dimensionsPositive
                        || !positive(option.capacityCbm()) || !positive(option.maximumCargoWeightKg())
                        || option.tareWeightKg() != null && !positive(option.tareWeightKg())
                        || option.maximumTotalWeightKg() != null && !positive(option.maximumTotalWeightKg())
                    || option.maximumTotalWeightKg() != null
                    && option.maximumTotalWeightKg().compareTo(option.maximumCargoWeightKg()) < 0) {
                conflicts.add("invalid required canonical source values for code: " + option.code());
            }
        }
                int optionCount = V3__align_fcl_container_catalogue.OPTIONS.size();
                if (!codes.equals(CANONICAL_CODES) || displayOrders.size() != optionCount
                    || displayOrders.stream().anyMatch(order -> order < 1 || order > optionCount)) {
                    conflicts.add("invalid canonical source code or display-order set");
                }
    }

    private static boolean positive(BigDecimal value) {
        return value != null && value.signum() > 0;
    }

    private static void requireTable(Connection connection, String table, List<String> conflicts) throws SQLException {
        if (!tableExists(connection, table)) {
            conflicts.add("missing required table: " + table);
        }
    }

    private static boolean tableExists(Connection connection, String table) throws SQLException {
        return queryLong(connection, """
                SELECT COUNT(*) FROM information_schema.tables
                WHERE table_schema = DATABASE() AND table_name = ?
                """, table) == 1;
    }

    private static boolean columnExists(Connection connection, String table, String column) throws SQLException {
        return queryLong(connection, """
                SELECT COUNT(*) FROM information_schema.columns
                WHERE table_schema = DATABASE() AND table_name = ? AND column_name = ?
                """, table, column) == 1;
    }

    private static void addQueryValues(Connection connection, List<String> values, String sql) throws SQLException {
        try (Statement statement = connection.createStatement(); ResultSet rows = statement.executeQuery(sql)) {
            while (rows.next()) {
                values.add(rows.getString(1));
            }
        }
    }

    record PreflightResult(Map<String, Long> ids, Map<Long, Long> referenceCounts) {
        String describeReferences() {
            return referenceCounts.entrySet().stream()
                    .map(entry -> entry.getKey() + "=" + entry.getValue())
                    .collect(Collectors.joining(", "));
        }
    }

    record CanonicalOption(
            String code,
            String name,
            BigDecimal internalLengthMeters,
            BigDecimal internalWidthMeters,
            BigDecimal internalHeightMeters,
            BigDecimal capacityCbm,
            BigDecimal tareWeightKg,
            BigDecimal maximumCargoWeightKg,
            BigDecimal maximumTotalWeightKg,
            int displayOrder) {
    }
}