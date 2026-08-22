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
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AdministrationContainerCatalogueHttpTest {

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

    @Test
    void returnsActiveAndRetiredOptionsUsingTheAdministrationContract() throws Exception {
        ResponseEntity<String> response = restTemplate.getForEntity(
                "http://localhost:" + port + "/container-types",
                String.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        JsonNode options = objectMapper.readTree(response.getBody());
        JsonNode active = findByCode(options, "20GP");
        JsonNode retired = findByCode(options, "20HC");

        assertThat(active).isEqualTo(objectMapper.readTree("""
                {
                  "id":1,
                  "code":"20GP",
                  "name":"20 Standard",
                  "description":"Standard 20-foot dry container for general cargo",
                  "internalDimensionsMeters":{"length":5.895,"width":2.350,"height":2.392},
                  "capacityCbm":33.00,
                  "tareWeightKg":2230.00,
                  "maximumCargoWeightKg":28230.00,
                  "maximumTotalWeightKg":30460.00,
                  "active":true,
                  "refrigerated":false,
                  "displayOrder":1
                }
                """));
        assertThat(retired.get("active").asBoolean()).isFalse();
        assertThat(retired.get("displayOrder").isNull()).isTrue();

        List<String> allowedFields = List.of(
                "id", "code", "name", "description", "internalDimensionsMeters", "capacityCbm",
                "tareWeightKg", "maximumCargoWeightKg", "maximumTotalWeightKg", "active",
                "refrigerated", "displayOrder");
        for (JsonNode option : options) {
            assertThat(iteratorToList(option.fieldNames())).containsExactlyInAnyOrderElementsOf(allowedFields);
        }
    }

    private static JsonNode findByCode(JsonNode options, String code) {
        return StreamSupport.stream(options.spliterator(), false)
                .filter(option -> code.equals(option.get("code").asText()))
                .findFirst()
                .orElseThrow();
    }

    private static List<String> iteratorToList(java.util.Iterator<String> values) {
        Iterable<String> iterable = () -> values;
        return StreamSupport.stream(iterable.spliterator(), false).toList();
    }
}