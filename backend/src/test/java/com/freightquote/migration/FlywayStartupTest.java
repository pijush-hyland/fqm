package com.freightquote.migration;

import static org.assertj.core.api.Assertions.assertThat;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.springframework.boot.WebApplicationType;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.context.ConfigurableApplicationContext;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import com.freightquote.FreightQuoteApplication;

@Testcontainers(disabledWithoutDocker = true)
class FlywayStartupTest {

    @Container
    private static final MySQLContainer<?> MYSQL = new MySQLContainer<>("mysql:8.0.44");

    @Test
    void startsTwiceWithFlywayCompleteAndHibernateValidationEnabled() {
        startAndAssertFlywayCurrent();
        startAndAssertFlywayCurrent();
    }

    private void startAndAssertFlywayCurrent() {
        try (ConfigurableApplicationContext context = new SpringApplicationBuilder(FreightQuoteApplication.class)
                .web(WebApplicationType.NONE)
                .properties(
                        "spring.datasource.url=" + MYSQL.getJdbcUrl(),
                        "spring.datasource.username=" + MYSQL.getUsername(),
                        "spring.datasource.password=" + MYSQL.getPassword(),
                        "spring.jpa.hibernate.ddl-auto=validate",
                        "spring.devtools.restart.enabled=false")
                .run()) {
            Flyway flyway = context.getBean(Flyway.class);
            assertThat(flyway.info().current().getVersion().getVersion()).isEqualTo("4");
            assertThat(flyway.migrate().migrationsExecuted).isZero();
        }
    }
}