package com.freightquote.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RateAdministrationHttpIntegrationTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.44");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", MYSQL::getJdbcUrl);
        registry.add("spring.datasource.username", MYSQL::getUsername);
        registry.add("spring.datasource.password", MYSQL::getPassword);
        registry.add("spring.profiles.active", () -> "test");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

        @Autowired
        private ObjectMapper objectMapper;

    private Long originId;
    private Long destinationId;
    private Long courierRateId;
        private Long retiredFclRateId;

    @BeforeEach
    void createHistoricalRate() {
        jdbcTemplate.update("INSERT INTO locations (code, name, country, type, is_active) VALUES ('RATO', 'Rate Origin', 'Test', 'SEA_PORT', 1)");
        jdbcTemplate.update("INSERT INTO locations (code, name, country, type, is_active) VALUES ('RATD', 'Rate Destination', 'Test', 'SEA_PORT', 1)");
        originId = jdbcTemplate.queryForObject("SELECT id FROM locations WHERE code = 'RATO'", Long.class);
        destinationId = jdbcTemplate.queryForObject("SELECT id FROM locations WHERE code = 'RATD'", Long.class);
        jdbcTemplate.update("""
                INSERT INTO courier_rates
                    (courier_name, shipping_type, sea_freight_mode, origin_location_id, destination_location_id,
                     effective_from, effective_to, is_active, description)
                VALUES ('RATE ADMIN TEST', 'WATER', 'FCL', ?, ?, '2026-09-01', '2027-09-01', 1, 'Historical rate')
                """, originId, destinationId);
        courierRateId = jdbcTemplate.queryForObject(
                "SELECT id FROM courier_rates WHERE courier_name = 'RATE ADMIN TEST'", Long.class);
        jdbcTemplate.update("""
                INSERT INTO fcl_freight_rates
                    (rate, currency, documentation_fee, bunker_adjustment_rate, container_type_id,
                     terminal_handling_charge, courier_rate_id, description)
                VALUES (100, 'USD', 10, 2, 1, 3, ?, 'Active association'),
                       (200, 'EUR', 20, 4, 2, 6, ?, 'Retired association')
                """, courierRateId, courierRateId);
        retiredFclRateId = jdbcTemplate.queryForObject(
                "SELECT id FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                Long.class,
                courierRateId);
    }

    @AfterEach
    void removeHistoricalRate() {
        jdbcTemplate.update("DELETE FROM fcl_freight_rates WHERE courier_rate_id = ?", courierRateId);
        jdbcTemplate.update("DELETE FROM courier_rates WHERE id = ?", courierRateId);
        jdbcTemplate.update("DELETE FROM locations WHERE id IN (?, ?)", originId, destinationId);
    }

    @Test
    void preservesAnOmittedRetiredAssociationDuringAnUnrelatedUpdate() {
        ResponseEntity<String> response = putRate("""
                {
                  "courierName": "RATE ADMIN TEST",
                  "origin": {"id": %d},
                  "destination": {"id": %d},
                  "shippingType": "WATER",
                  "seaFreightMode": "FCL",
                  "effectiveFrom": "2026-09-01",
                  "effectiveTo": "2027-09-01",
                  "isActive": true,
                  "description": "Unrelated edit",
                  "ratesForFCL": {"1": 100}
                }
                """.formatted(originId, destinationId));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                Integer.class,
                courierRateId)).isEqualTo(1);
        assertThat(jdbcTemplate.queryForObject(
                "SELECT rate FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                BigDecimal.class,
                courierRateId)).isEqualByComparingTo("200.00");
        assertThat(jdbcTemplate.queryForObject(
                "SELECT currency FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                String.class,
                courierRateId)).isEqualTo("EUR");
        assertRetiredAssociationIdentityAndFees();
    }

        @Test
        void rejectsCreatingARetiredAssociationWithStableErrorDetails() throws Exception {
                ResponseEntity<String> response = postRate(rateBody("{\"2\": 250}", true));

                assertInvalidContainerSelection(response, "[2]");
        }

        @Test
        void rejectsAddingARetiredAssociationDuringAnUpdate() throws Exception {
                jdbcTemplate.update("DELETE FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2", courierRateId);

                ResponseEntity<String> response = putRate(rateBody("{\"1\": 100, \"2\": 250}", true));

                assertInvalidContainerSelection(response, "[2]");
        }

        @Test
        void correctsAnExistingRetiredAmountAndExpiresItsParentWithoutChangingOtherMoneyFields() {
                ResponseEntity<String> response = putRate(rateBody("{\"1\": 100, \"2\": 225}", false));

                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
                assertThat(jdbcTemplate.queryForObject(
                                "SELECT rate FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                                BigDecimal.class,
                                courierRateId)).isEqualByComparingTo("225.00");
                assertThat(jdbcTemplate.queryForObject(
                                "SELECT currency FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                                String.class,
                                courierRateId)).isEqualTo("EUR");
                assertThat(jdbcTemplate.queryForObject(
                                "SELECT documentation_fee FROM fcl_freight_rates WHERE courier_rate_id = ? AND container_type_id = 2",
                                BigDecimal.class,
                                courierRateId)).isEqualByComparingTo("20.00");
                assertRetiredAssociationIdentityAndFees();
                assertThat(jdbcTemplate.queryForObject(
                                "SELECT is_active FROM courier_rates WHERE id = ?",
                                Boolean.class,
                                courierRateId)).isFalse();
        }

            private void assertRetiredAssociationIdentityAndFees() {
                Map<String, Object> association = jdbcTemplate.queryForMap("""
                        SELECT id, courier_rate_id, container_type_id, bunker_adjustment_rate,
                               terminal_handling_charge, documentation_fee, currency
                        FROM fcl_freight_rates
                        WHERE courier_rate_id = ? AND container_type_id = 2
                        """, courierRateId);

                assertThat(((Number) association.get("id")).longValue()).isEqualTo(retiredFclRateId);
                assertThat(((Number) association.get("courier_rate_id")).longValue()).isEqualTo(courierRateId);
                assertThat(((Number) association.get("container_type_id")).longValue()).isEqualTo(2L);
                assertThat((BigDecimal) association.get("bunker_adjustment_rate")).isEqualByComparingTo("4.00");
                assertThat((BigDecimal) association.get("terminal_handling_charge")).isEqualByComparingTo("6.00");
                assertThat((BigDecimal) association.get("documentation_fee")).isEqualByComparingTo("20.00");
                assertThat(association.get("currency")).isEqualTo("EUR");
            }

        private void assertInvalidContainerSelection(ResponseEntity<String> response, String expectedIds) throws Exception {
                assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                JsonNode error = objectMapper.readTree(response.getBody());
                assertThat(error.get("code").asText()).isEqualTo("INVALID_CONTAINER_SELECTION");
                assertThat(error.get("containerIds")).isEqualTo(objectMapper.readTree(expectedIds));
        }

        private String rateBody(String ratesForFCL, boolean active) {
                return """
                                {
                                  "courierName": "RATE ADMIN TEST",
                                  "origin": {"id": %d},
                                  "destination": {"id": %d},
                                  "shippingType": "WATER",
                                  "seaFreightMode": "FCL",
                                  "effectiveFrom": "2026-09-01",
                                  "effectiveTo": "2027-09-01",
                                  "isActive": %s,
                                  "currency": "USD",
                                  "documentationFee": 99,
                                  "ratesForFCL": %s
                                }
                                """.formatted(originId, destinationId, active, ratesForFCL);
        }

        private ResponseEntity<String> postRate(String body) {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                return restTemplate.exchange(
                                "http://localhost:" + port + "/courier-rates",
                                HttpMethod.POST,
                                new HttpEntity<>(body, headers),
                                String.class);
        }

    private ResponseEntity<String> putRate(String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.exchange(
                "http://localhost:" + port + "/courier-rates/" + courierRateId,
                HttpMethod.PUT,
                new HttpEntity<>(body, headers),
                String.class);
    }
}