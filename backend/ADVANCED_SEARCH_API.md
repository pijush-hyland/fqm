# Advanced Courier Rate Search API

## Endpoint
```
POST /api/courier-rates/search-advanced
```

## Features
- **Dynamic Filtering**: Combine multiple search criteria
- **Flexible Location Search**: Search by location name, code, or ID
- **Date Range Filtering**: Active dates, effective periods
- **Container Type Support**: Specific filtering for FCL rates
- **Pagination & Sorting**: Built-in pagination with custom sorting
- **Performance Optimized**: Database-level filtering using JPA Specifications

## Request Example

### Basic Search
```json
{
  "courierName": "DHL",
  "shippingType": "WATER",
  "currentlyActive": true,
  "page": 0,
  "size": 10
}
```

### Advanced Search
```json
{
  "courierName": "DHL",
  "shippingType": "WATER",
  "seaFreightMode": "FCL",
  "origin": "New York",
  "destination": "Los Angeles",
  "containerTypeId": 1,
  "maxTransitDays": 15,
  "activeOnDate": "2024-12-01",
  "effectiveFromAfter": "2024-01-01",
  "effectiveToBefore": "2024-12-31",
  "description": "express",
  "currentlyActive": true,
  "page": 0,
  "size": 20,
  "sortBy": "transitDays",
  "sortDirection": "ASC"
}
```

### Search by Specific Locations
```json
{
  "originId": 123,
  "destinationId": 456,
  "shippingType": "AIR",
  "currentlyActive": true
}
```

## Response Example
```json
{
  "content": [
    {
      "id": 1,
      "courierName": "DHL Express",
      "shippingType": "WATER",
      "seaFreightMode": "FCL",
      "origin": {
        "id": 123,
        "locationCode": "USNYC",
        "city": "New York",
        "country": "USA"
      },
      "destination": {
        "id": 456,
        "locationCode": "USLAX",
        "city": "Los Angeles", 
        "country": "USA"
      },
      "transitDays": 12,
      "effectiveFrom": "2024-01-01",
      "effectiveTo": "2024-12-31",
      "rate": 1500.00,
      "currency": "INR"
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "sorted": true,
      "ascending": true
    }
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "numberOfElements": 1
}
```

## Search Criteria Fields

| Field | Type | Description |
|-------|------|-------------|
| `courierName` | String | Partial match on courier name (case-insensitive) |
| `shippingType` | Enum | AIR, WATER |
| `seaFreightMode` | Enum | FCL, LCL (for WATER shipping) |
| `origin` | String | Search in origin location (code, city, country) |
| `destination` | String | Search in destination location (code, city, country) |
| `originId` | Long | Specific origin location ID |
| `destinationId` | Long | Specific destination location ID |
| `activeOnDate` | Date | Rate must be active on this date |
| `effectiveFromAfter` | Date | Rates starting from this date |
| `effectiveToBefore` | Date | Rates ending before this date |
| `containerTypeId` | Long | For FCL rates only |
| `maxTransitDays` | Integer | Maximum transit days |
| `description` | String | Partial match in description |
| `currentlyActive` | Boolean | Filter only currently active rates |
| `page` | Integer | Page number (0-based) |
| `size` | Integer | Page size (1-100) |
| `sortBy` | String | Field to sort by |
| `sortDirection` | String | ASC or DESC |

## Advanced Query Examples

### Find all active FCL rates from US to Europe with DHL
```json
{
  "courierName": "DHL",
  "shippingType": "WATER",
  "seaFreightMode": "FCL",
  "origin": "US",
  "destination": "EU",
  "currentlyActive": true,
  "sortBy": "rate",
  "sortDirection": "ASC"
}
```

### Find fast air freight options (max 5 days)
```json
{
  "shippingType": "AIR",
  "maxTransitDays": 5,
  "currentlyActive": true,
  "sortBy": "transitDays",
  "sortDirection": "ASC"
}
```

### Find rates effective in December 2024
```json
{
  "effectiveFromAfter": "2024-12-01",
  "effectiveToBefore": "2024-12-31",
  "sortBy": "effectiveFrom",
  "sortDirection": "ASC"
}
```

## Benefits

1. **Powerful Filtering**: Combine any criteria for precise results
2. **Performance**: Database-level filtering with JPA Specifications
3. **Flexible**: Search by partial text, exact IDs, or date ranges
4. **Paginated**: Handle large result sets efficiently
5. **Sortable**: Custom sorting by any field
6. **Type-Safe**: Strong typing with DTOs and validation
