package com.freightquote.controller;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
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
class QuoteHttpIntegrationTest {

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
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void rejectsAnUnknownFclSelectionWithStableErrorDetails() throws Exception {
        ResponseEntity<String> response = postQuotes("""
                {
                  "origin": 1,
                  "destination": 2,
                  "shippingType": "WATER",
                  "seaFreightMode": "FCL",
                  "shippingDate": "2026-09-01",
                  "containerCount": {"999": 1}
                }
                """);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        JsonNode error = objectMapper.readTree(response.getBody());
        assertThat(error.get("code").asText()).isEqualTo("INVALID_CONTAINER_SELECTION");
        assertThat(error.get("containerIds")).isEqualTo(objectMapper.readTree("[999]"));
    }

    @Test
    void acceptsTheActiveTankOptionWhenNoRouteRateExists() throws Exception {
        ResponseEntity<String> response = postQuotes("""
                {
                  "origin": 1,
                  "destination": 2,
                  "shippingType": "WATER",
                  "seaFreightMode": "FCL",
                  "shippingDate": "2026-09-01",
                  "containerCount": {"12": 1}
                }
                """);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(objectMapper.readTree(response.getBody())).isEqualTo(objectMapper.readTree("[]"));
    }

    @ParameterizedTest
    @ValueSource(strings = {
        "\"2\": 1",
        "\"1\": 0",
        "\"1\": -1"
    })
    void rejectsRetiredAndNonPositiveSelections(String selection) throws Exception {
        assertInvalidSelection(selection);
    }

    @Test
    void rejectsMalformedContainerIds() throws Exception {
        ResponseEntity<String> response = postQuotes(requestBody("\"not-an-id\": 1"));

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        JsonNode error = objectMapper.readTree(response.getBody());
        assertThat(error.get("code").asText()).isEqualTo("INVALID_CONTAINER_SELECTION");
        assertThat(error.get("containerIds")).isEqualTo(objectMapper.readTree("[\"not-an-id\"]"));
    }

    @Test
    void rejectsAnActiveOptionWithInvalidRequiredDetails() throws Exception {
        jdbcTemplate.update("UPDATE container_types SET capacity_cbm = 0 WHERE id = 1");
        try {
            assertInvalidSelection("\"1\": 1");
        } finally {
            jdbcTemplate.update("UPDATE container_types SET capacity_cbm = 33.00 WHERE id = 1");
        }
    }

    @Test
    void excludesUnrelatedRetiredRateEntriesFromCustomerQuoteResponses() throws Exception {
        jdbcTemplate.update("INSERT INTO locations (code, name, country, type, is_active) VALUES ('TSTO', 'Test Origin', 'Test', 'SEA_PORT', 1)");
        jdbcTemplate.update("INSERT INTO locations (code, name, country, type, is_active) VALUES ('TSTD', 'Test Destination', 'Test', 'SEA_PORT', 1)");
        Long originId = jdbcTemplate.queryForObject("SELECT id FROM locations WHERE code = 'TSTO'", Long.class);
        Long destinationId = jdbcTemplate.queryForObject("SELECT id FROM locations WHERE code = 'TSTD'", Long.class);
        jdbcTemplate.update("""
                INSERT INTO courier_rates
                    (courier_name, shipping_type, sea_freight_mode, origin_location_id, destination_location_id,
                     effective_from, effective_to, is_active)
                VALUES ('TEST', 'WATER', 'FCL', ?, ?, '2026-01-01', '2026-12-31', 1)
                """, originId, destinationId);
        Long courierRateId = jdbcTemplate.queryForObject(
                "SELECT id FROM courier_rates WHERE courier_name = 'TEST'", Long.class);
        jdbcTemplate.update("""
                INSERT INTO fcl_freight_rates
                    (rate, currency, documentation_fee, bunker_adjustment_rate, container_type_id,
                     terminal_handling_charge, courier_rate_id)
                VALUES (200, 'USD', 99, 0, 2, 0, ?), (100, 'USD', 10, 0, 1, 0, ?)
                """, courierRateId, courierRateId);

        try {
            ResponseEntity<String> response = postQuotes(requestBody(
                    "\"1\": 1",
                    originId,
                    destinationId));

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            JsonNode quotes = objectMapper.readTree(response.getBody());
            assertThat(quotes).hasSize(1);
            assertThat(quotes.get(0).get("ratesForFCL"))
                    .isEqualTo(objectMapper.readTree("{\"1\":100.00}"));
            assertThat(quotes.get(0).get("documentationFee").decimalValue())
                    .isEqualByComparingTo("10.00");
        } finally {
            jdbcTemplate.update("DELETE FROM fcl_freight_rates WHERE courier_rate_id = ?", courierRateId);
            jdbcTemplate.update("DELETE FROM courier_rates WHERE id = ?", courierRateId);
            jdbcTemplate.update("DELETE FROM locations WHERE id IN (?, ?)", originId, destinationId);
        }
    }

    private void assertInvalidSelection(String selection) throws Exception {
        ResponseEntity<String> response = postQuotes(requestBody(selection));
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(objectMapper.readTree(response.getBody()).get("code").asText())
                .isEqualTo("INVALID_CONTAINER_SELECTION");
    }

    private String requestBody(String selection) {
        return requestBody(selection, 1L, 2L);
    }

    private String requestBody(String selection, Long origin, Long destination) {
        return """
                {
                  "origin": %d,
                  "destination": %d,
                  "shippingType": "WATER",
                  "seaFreightMode": "FCL",
                  "shippingDate": "2026-09-01",
                  "containerCount": {%s}
                }
                """.formatted(origin, destination, selection);
    }

    private ResponseEntity<String> postQuotes(String body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return restTemplate.exchange(
                "http://localhost:" + port + "/quotes/get-quotes",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                String.class);
    }
}