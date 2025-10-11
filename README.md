# Freight Quote Management System

A full-stack web application for managing and displaying shipment costs via air and water transportation.

## System Architecture

- **Backend**: Spring Boot 3.1.5 with MySQL
- **Frontend**: React 18 with Axios
- **Database**: MySQL 8.0
- **Build Tool**: Maven (Backend), npm (Frontend)

## Prerequisites

Before running the application, ensure you have the following installed:

1. **Java 17 or higher**
   - Download from: https://adoptium.net/
   - Verify: `java -version`

2. **Node.js 16 or higher**
   - Download from: https://nodejs.org/
   - Verify: `node --version` and `npm --version`

3. **MySQL 8.0**
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Default configuration expected:
     - Host: localhost
     - Port: 3306
     - Username: root
     - Password: admin

4. **Maven** (Optional - included with most Java IDEs)
   - Download from: https://maven.apache.org/download.cgi
   - Verify: `mvn --version`

## Quick Start

### Option 1: One-Command Setup (Recommended)

For Windows:
```bash
run.bat
```

For Linux/Mac:
```bash
chmod +x run.sh
./run.sh
```

This script will:
- Check all prerequisites
- Install frontend dependencies
- Start the Spring Boot backend
- Start the React frontend
- Open the application in your default browser

### Option 2: Manual Setup

1. **Start MySQL Database**
   ```sql
   -- The application will automatically create the database 'freight_quote_db'
   -- Just ensure MySQL is running with the credentials: root/admin
   ```

2. **Start Backend**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   Backend will be available at: http://localhost:8080

3. **Start Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```
   Frontend will be available at: http://localhost:3000

## Application Features

### Admin Dashboard (`/admin`)
- Add new courier rates
- Edit existing rates
- Delete rates
- View all rates with management actions

### User Page (`/user` or `/`)
- View active shipment costs
- Filter by shipping type (Air/Water)
- Filter by container type (FCL/LCL for water shipping)
- Search by origin and destination
- View statistics and cost summaries

## API Endpoints

### Courier Rates Management

- `GET /api/courier-rates` - Get all rates
- `GET /api/courier-rates/{id}` - Get rate by ID
- `POST /api/courier-rates` - Create new rate
- `PUT /api/courier-rates/{id}` - Update rate
- `DELETE /api/courier-rates/{id}` - Delete rate
- `GET /api/courier-rates/active` - Get active rates
- `GET /api/courier-rates/search` - Search rates with filters

### Search Parameters
- `shippingType`: AIR or WATER
- `containerType`: FCL or LCL (for water shipping)
- `origin`: Origin location (partial match)
- `destination`: Destination location (partial match)

## Database Schema

### courier_rates table
```sql
CREATE TABLE courier_rates (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    shipping_type ENUM('AIR', 'WATER') NOT NULL,
    container_type ENUM('FCL', 'LCL'),
    cost DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    description VARCHAR(500),
    created_at DATE,
    updated_at DATE
);
```

## Project Structure

```
freight-quote-webapp/
├── backend/
│   ├── src/main/java/com/freightquote/
│   │   ├── FreightQuoteApplication.java
│   │   ├── entity/CourierRate.java
│   │   ├── repository/CourierRateRepository.java
│   │   ├── service/CourierRateService.java
│   │   ├── controller/CourierRateController.java
│   │   ├── dto/CourierRateDto.java
│   │   └── config/WebConfig.java
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CourierRateForm.js
│   │   │   ├── CourierRateTable.js
│   │   │   └── FilterPanel.js
│   │   ├── pages/
│   │   │   ├── AdminDashboard.js
│   │   │   └── UserPage.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/index.html
│   └── package.json
├── run.bat (Windows)
├── run.sh (Linux/Mac)
└── README.md
```

## Configuration

### Backend Configuration (application.properties)
```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/freight_quote_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=admin

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# Server
server.port=8080

# CORS
spring.web.cors.allowed-origins=http://localhost:3000
```

### Frontend Configuration (package.json)
```json
{
  "proxy": "http://localhost:8080"
}
```

## Troubleshooting

### Common Issues

1. **MySQL Connection Failed**
   - Ensure MySQL is running
   - Check credentials (root/admin)
   - Verify port 3306 is accessible

2. **Backend Won't Start**
   - Check Java version (17+)
   - Ensure port 8080 is free
   - Verify MySQL connection

3. **Frontend Won't Start**
   - Check Node.js version (16+)
   - Run `npm install` in frontend directory
   - Ensure port 3000 is free

4. **API Calls Failing**
   - Check CORS configuration
   - Verify backend is running on port 8080
   - Check browser console for errors

### Port Conflicts
If default ports are occupied:

**Backend Port (8080)**:
- Change `server.port` in `application.properties`
- Update frontend API calls in `services/api.js`

**Frontend Port (3000)**:
- Set environment variable: `PORT=3001 npm start`

## Development

### Adding New Features

1. **Backend Changes**:
   - Add new endpoints in `CourierRateController`
   - Update service layer in `CourierRateService`
   - Add repository methods if needed

2. **Frontend Changes**:
   - Add API calls in `services/api.js`
   - Create/update components
   - Update routing in `App.js`

### Testing

**Backend Testing**:
```bash
cd backend
mvn test
```

**Frontend Testing**:
```bash
cd frontend
npm test
```

## Production Deployment

For production deployment:

1. **Backend**:
   - Build: `mvn clean package`
   - Run: `java -jar target/freight-quote-backend-0.0.1-SNAPSHOT.jar`

2. **Frontend**:
   - Build: `npm run build`
   - Serve the `build/` directory with a web server

3. **Database**:
   - Use production MySQL instance
   - Update connection properties
   - Consider using environment variables for credentials

## Support

For issues or questions:
1. Check the troubleshooting section
2. Verify all prerequisites are installed
3. Check console logs for error messages
4. Ensure all services are running on correct ports

## License

This project is for demonstration purposes.
