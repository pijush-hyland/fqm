# FCL Catalogue Migration Runbook

Flyway runs before Hibernate on every normal application startup. Hibernate uses `ddl-auto=validate`; it does not create or update tables.

## Database Paths

- An empty database runs `V0` to create the application baseline, then applies all later migrations.
- A non-empty database without Flyway history is baselined at version `0`, preserving its existing schema and data, then applies `V1` and later migrations.
- A database with current Flyway history performs no migration work on a second startup.

Never baseline manually at version `1` or later. Doing so skips required catalogue migrations.

## Deployment Gate

1. Create a named environment backup or snapshot and record its identifier in the deployment record.
2. Compile the backend and run the catalogue-read-only preflight against the target database. Flyway records its baseline and version metadata, but the preflight does not mutate application schema or catalogue rows:

   ```bash
   cd backend
   mvn compile org.flywaydb:flyway-maven-plugin:11.7.2:migrate \
     -Dflyway.url="$DB_URL" \
     -Dflyway.user="$DB_USERNAME" \
     -Dflyway.password="$DB_PASSWORD" \
     -Dflyway.baselineOnMigrate=true \
     -Dflyway.baselineVersion=0 \
     -Dflyway.target=1
   ```

3. Review and retain the `FCL catalogue preflight` report. It must list canonical matches, required inserts, known and custom retirements, reference counts, and no blocking conflicts.
4. Resolve every conflict before deployment. Do not bypass or repair Flyway history.
5. Start the application normally. The transactional data migration repeats preflight checks before mutation and runs postflight assertions before commit.
6. Confirm Flyway versions `0` through `4` are successful and the postflight log reports six active canonical options. Version `4` removes the obsolete calculated measurement columns.
7. Restart once and confirm Flyway reports no pending migrations.

## Recovery

There is no automated down migration. If the schema or catalogue must be rolled back, stop deployment, restore the named pre-deployment backup or snapshot, and deploy the previously known-good application version against the restored database. Reverting application code alone does not reverse database state.