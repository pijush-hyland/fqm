package com.freightquote.controller;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.stream.StreamSupport;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.HttpStatus;
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
class CustomerContainerCatalogueHttpTest {

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
    void returnsOnlyCanonicalActiveOptionsInDisplayOrderUsingTheCustomerContract() throws Exception {
        jdbcTemplate.update("UPDATE container_types SET is_active = 1 WHERE code = '20HC'");
        try {
            ResponseEntity<String> response = getCustomerOptions();

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            JsonNode options = objectMapper.readTree(response.getBody());

            assertThat(options).hasSize(6);
            assertThat(values(options, "code")).containsExactly("20GP", "40GP", "20OT", "40HC", "40OT", "20TK");
            assertThat(values(options, "name")).containsExactly(
                "20 Standard", "40 Standard", "20 Open Top", "40 High Cube",
                "40 Open Top High", "20 Feet Iso Tank");

            assertThat(options).isEqualTo(objectMapper.readTree("""
                [
                  {"id":1,"code":"20GP","name":"20 Standard","internalDimensionsMeters":{"length":5.895,"width":2.350,"height":2.392},"capacityCbm":33.00,"maximumCargoWeightKg":28230.00},
                  {"id":3,"code":"40GP","name":"40 Standard","internalDimensionsMeters":{"length":12.029,"width":2.350,"height":2.392},"capacityCbm":60.00,"maximumCargoWeightKg":27000.00},
                  {"id":8,"code":"20OT","name":"20 Open Top","internalDimensionsMeters":null,"capacityCbm":33.00,"maximumCargoWeightKg":27320.00},
                  {"id":4,"code":"40HC","name":"40 High Cube","internalDimensionsMeters":{"length":12.024,"width":2.350,"height":2.697},"capacityCbm":67.00,"maximumCargoWeightKg":27000.00},
                  {"id":9,"code":"40OT","name":"40 Open Top High","internalDimensionsMeters":null,"capacityCbm":62.50,"maximumCargoWeightKg":28500.00},
                  {"id":12,"code":"20TK","name":"20 Feet Iso Tank","internalDimensionsMeters":null,"capacityCbm":24.00,"maximumCargoWeightKg":32200.00}
                ]
                """));

            List<String> allowedFields = List.of(
                "id", "code", "name", "internalDimensionsMeters", "capacityCbm", "maximumCargoWeightKg");
            for (JsonNode option : options) {
            assertThat(iteratorToList(option.fieldNames())).containsExactlyInAnyOrderElementsOf(allowedFields);
            }
        } finally {
            jdbcTemplate.update("UPDATE container_types SET is_active = 0 WHERE code = '20HC'");
        }
    }

        @Test
        void excludesAnInactiveCanonicalOption() throws Exception {
        jdbcTemplate.update("UPDATE container_types SET is_active = 0 WHERE code = '20GP'");
        try {
            JsonNode options = objectMapper.readTree(getCustomerOptions().getBody());

            assertThat(values(options, "code")).containsExactly("40GP", "20OT", "40HC", "40OT", "20TK");
        } finally {
            jdbcTemplate.update("UPDATE container_types SET is_active = 1 WHERE code = '20GP'");
        }
        }

        private ResponseEntity<String> getCustomerOptions() {
        return restTemplate.getForEntity(
            "http://localhost:" + port + "/container-types/customer", String.class);
        }

    private static List<String> values(JsonNode options, String field) {
        return StreamSupport.stream(options.spliterator(), false)
                .map(option -> option.get(field).asText())
                .toList();
    }

    private static List<String> iteratorToList(java.util.Iterator<String> values) {
        Iterable<String> iterable = () -> values;
        return StreamSupport.stream(iterable.spliterator(), false).toList();
    }
}