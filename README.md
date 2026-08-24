# Freight Quote Management

## Overview

Freight Quote Management (RFQ) is a full-stack application for maintaining freight rates and the reference data used to prepare air and ocean freight quotations. It provides customer quotation flows and administration tools for rates, locations, and FCL Container Options.

This README is the canonical human guide for understanding, running, testing, configuring, deploying, and operating the repository. Detailed API contracts remain owned by application source and tests.

## Architecture

- The backend is a Java 17, Spring Boot 3.5.7 application built as a Maven JAR. Spring MVC exposes the HTTP API, Spring Data JPA accesses MySQL, and Flyway owns database migration.
- The frontend is a React 19.1.0 and TypeScript application built by Vite 6.3.5. Its shared HTTP client uses native `fetch`.
- The backend listens on port `8080` by default. The Vite development server listens on port `3000`.
- During development, Vite proxies requests beginning with `VITE_API_BASE_URL` to the backend on port `8080` and removes that prefix. The prefix is a frontend development concern, not part of every backend controller mapping.

## Prerequisites

Install the following locally:

- Java 17
- Maven 3
- Node.js 20.19 or later in the 20.x line, 22.12 or later, or 24 and later, plus a compatible npm version
- MySQL 8

Verify the tools with `java -version`, `mvn --version`, `node --version`, and `npm --version`. Start MySQL and create an empty `freight_quote_db` database before using the default local profile. The default local connection uses MySQL on `localhost:3306`; override its configuration instead of committing credentials.

## Local Quick Start

Use two terminals from the repository root. Start the backend first:

```bash
cd backend
mvn spring-boot:run
```

Then install the locked frontend dependencies and start Vite:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:3000`. The backend is available at `http://localhost:8080`.

The root `run.sh`, `run-windows.sh`, and `run.bat` files are intended as conveniences, but they currently invoke the nonexistent frontend command `npm start`. Do not use them as the normal startup path.

## Testing

Run backend tests:

```bash
cd backend
mvn test
```

Run frontend unit tests and linting:

```bash
cd frontend
npm test
npm run lint
```

Create production builds:

```bash
cd backend
mvn clean package
```

```bash
cd frontend
npm run build
```

The backend artifact is written under `backend/target/`; the frontend artifact is written to `frontend/dist/`.

## Configuration

### Backend

The default profile is `local`. Select another profile with `SPRING_PROFILES_ACTIVE`:

- `local` supplies defaults for a local MySQL database, local CORS origins, and port `8080`.
- `dev` and `prod` require external database and CORS configuration.

Supported runtime variables include `SPRING_PROFILES_ACTIVE`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `CORS_ALLOWED_ORIGINS`, and `SERVER_PORT`. Production also permits `DDL_AUTO`; it must remain `validate`. Keep credentials and environment-specific origins outside version control.

CORS is centralized in `WebConfig` and configured with the `cors.*` property family. Controllers do not own independent CORS policy.

### Frontend

Vite mode files follow the `.env.*` convention under `frontend/` and are ignored by Git. Supported variables are declared in `frontend/src/vite-env.d.ts`:

- `VITE_APP_NAME` and `VITE_APP_VERSION`
- `VITE_API_BASE_URL` and `VITE_API_TIMEOUT`
- `VITE_ENABLE_DEBUG`, `VITE_ENABLE_ANALYTICS`, and `VITE_LOG_LEVEL`

Only `VITE_*` values are available to browser code, so never put secrets in them. Debug logging occurs only when the Vite mode is `development` and `VITE_ENABLE_DEBUG` is `true`.

For local development, configure `VITE_API_BASE_URL` as the path prefix that Vite should proxy. The proxy forwards to `http://localhost:8080` and strips the prefix before the request reaches Spring controllers.

## Deployment

The standard development deployment is the GitHub Actions workflow in `.github/workflows/deploy-dev.yml`, triggered by a push to `develop` or a manual dispatch. It:

1. Builds and tests the backend JAR and builds the frontend.
2. Stages the JAR in the deployment S3 bucket.
3. Validates the target EC2 instance and its SSM connection, then invokes `/opt/freight-quote/deploy.sh` through SSM.
4. Synchronizes the frontend artifact to its S3 bucket with the single cache policy `public, max-age=0, must-revalidate`.
5. Invalidates CloudFront when a distribution ID is configured.

The workflow requires configured GitHub secrets for AWS credentials, `AWS_REGION`, the development deployment bucket, EC2 instance ID, frontend S3 bucket, and API URL. It uses a frontend URL only in the deployment summary and a CloudFront distribution ID only when invalidation is configured. Repository documentation intentionally does not contain their values.

Each backend deployment downloads both `backend/freight-quote-backend.jar` and `config/application.env` from the deployment bucket. The latter replaces `/opt/freight-quote/application.env`, is owned by the service account, and is set to mode `600` before the systemd service restarts. Update the S3 object before deploying database credentials, CORS origins, or other backend environment changes.

The provisioning scripts encode intended infrastructure choices, not verified live cloud state:

- Development and production use account-qualified deployment and UI S3 bucket names, Amazon Linux EC2, private MySQL RDS, an EC2 instance profile with SSM and bucket access, and a `freight-quote-backend` systemd service.
- Development configures a `t3.small` EC2 instance and `db.t3.micro` RDS instance. Production configures `t3.micro` for both.
- Both UI buckets are configured for S3 website hosting. The production CloudFront distribution uses the S3 website endpoint as its origin.

Before relying on any environment, verify the actual resources, permissions, region, and deployment state in AWS. The repository does not prove that live resources match these choices.

## Operations and Warnings

### Consequential Warnings

- Flyway is the exclusive schema owner. Hibernate uses `ddl-auto=validate` in every profile and must never create or update the schema. Although production exposes a `DDL_AUTO` override, keep it set to `validate`.
- Every backend deployment replaces `/opt/freight-quote/application.env` from the deployment bucket. An EC2-local edit will not survive the next deployment.
- `AWS_REGION` is required by the deployment workflow. A resource in another region will not be found merely because its identifier is otherwise correct.
- The backend does not include Spring Boot Actuator, so `/actuator/health` is unsupported. Infrastructure references to that path are stale and must not be used as deployment verification.
- The root startup scripts are unreliable while they invoke `npm start`; use the manual quick-start commands above.

### FCL Catalogue Migration

Flyway runs before Hibernate on every normal startup. The repository contains SQL migrations `V0`, `V2`, and `V4` under `backend/src/main/resources/db/migration/` and Java migrations `V1` and `V3` under `backend/src/main/java/db/migration/`.

Database state determines the migration path:

- An empty database runs `V0` to create the application baseline, then applies all later migrations.
- A non-empty database without Flyway history is baselined at version `0`, preserving existing schema and data, then applies `V1` and later migrations.
- A database with migration history behind version `4` applies only pending migrations.
- A database current through version `4` performs no migration work on repeat startup.

Never baseline manually at version `1` or later because that skips required catalogue migrations.

#### Deployment Gate

1. Create a named backup or snapshot of the target database and record its identifier in the deployment record.
2. Compile the backend and run the catalogue read-only preflight against the target database. Flyway records baseline and version metadata, but this step does not mutate application schema or catalogue rows:

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
4. Resolve every conflict before deployment. Do not bypass checks or use Flyway repair to conceal migration-history problems.
5. Start the application normally. The transactional data migration repeats preflight checks before mutation and runs postflight assertions before commit.
6. Confirm Flyway versions `0` through `4` are successful. Confirm the postflight log reports exactly these six active FCL Container Options: `20GP`, `40GP`, `20OT`, `40HC`, `40OT`, and `20TK`. Version `4` removes the obsolete calculated measurement columns.
7. Restart once and confirm Flyway reports no pending migrations. Repeat startup is expected to be idempotent.

There is no automated down migration. If schema or catalogue state must be rolled back, stop the deployment, restore the named pre-deployment backup or snapshot, and deploy the previously known-good application version against the restored database. Reverting application code alone does not reverse database state.

## Repository Map

- `backend/src/main/java/com/freightquote/` contains controllers, DTOs, services, repositories, entities, configuration, and the application entry point.
- `backend/src/main/java/db/migration/` and `backend/src/main/resources/db/migration/` contain Java and SQL Flyway migrations respectively.
- `backend/src/test/java/` contains backend contract, service, integration, and migration tests.
- `frontend/src/apis/` contains the shared HTTP client and capability-specific API modules.
- `frontend/src/components/` and `frontend/src/pages/` contain the React user interface.
- `frontend/src/test/` and `frontend/e2e/` contain frontend unit and Playwright tests.
- `.github/workflows/` contains CI/CD workflows.
- `infrastructure/` contains EC2 setup and development and production provisioning scripts.
- `CONTEXT.md` is the focused glossary for FCL Container Option business language; it is not an operating guide.

The backend exposes capabilities for courier-rate management and search, locations, container catalogues, quotations, and rate administration. For exact paths, request and response fields, validation, sorting, and error behavior, use the relevant controllers, DTOs, specifications, frontend API modules, and tests. Those executable artifacts own the API contract.
