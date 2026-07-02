#!/usr/bin/env node
/**
 * Generate API documentation from Stocky Backend OpenAPI spec
 * 
 * This script fetches the OpenAPI spec from the backend and generates
 * markdown documentation for the StockyWeb frontend.
 */

import { writeFileSync } from 'fs';

const BACKEND_API_URL = 'http://localhost:8000/api/v1/openapi.json';
const OUTPUT_FILE = 'docs/architecture/api-reference.md';

/**
 * Generate markdown documentation from OpenAPI spec
 */
async function generateApiDocs() {
    console.log('🔍 Fetching OpenAPI specification from backend...');
    
    try {
        // Try to fetch the OpenAPI spec
        const response = await fetch(BACKEND_API_URL);
        
        if (!response.ok) {
            console.log(`⚠️  Could not fetch OpenAPI spec from ${BACKEND_API_URL}`);
            console.log(`   Status: ${response.status} ${response.statusText}`);
            console.log(`   This is expected if the backend is not running locally.`);
            console.log(`   Running 'npm run docs:api' when backend is stopped will generate documentation from static template.`);
            await generateStaticDocs();
        } else {
            const spec = await response.json();
            console.log('✅ OpenAPI specification fetched successfully');
            
            // Parse and transform the spec into markdown
            const doc = transformSpecToMarkdown(spec);
            
            writeFileSync(OUTPUT_FILE, doc, 'utf8');
            console.log(`📝 API documentation generated: ${OUTPUT_FILE}`);
            
            console.log('\n📊 Generated sections:');
            doc.match(/### (.+)$/gm).forEach(section => {
                console.log(`   - ${section.replace('### ', '')}`);
            });
        }
        
    } catch (error) {
        console.log(`⚠️  Error fetching OpenAPI spec: ${error.message}`);
        console.log(`   Generating documentation from static template instead...`);
        await generateStaticDocs();
    }
}

/**
 * Generate static documentation template
 */
function generateStaticDocs() {
    console.log('📝 Generating static API documentation template...');
    
    const doc = `# Stocky Backend API Reference

**Version:** v1  
**Base URL:** \`/api/v1\`  
**Authentication:** JWT Bearer Token or API Key  

> ⚠️ **Auto-generated from OpenAPI spec**  
> This documentation is automatically generated from the backend's OpenAPI specification.  
> Run \`npm run docs:api\` to regenerate when the backend API changes.  
> 
> **Note:** This is a static template. The actual API documentation is generated from the backend's OpenAPI spec when available.

---

## Table of Contents

1. [Authentication](#authentication)
2. [Authentication Endpoints](#authentication-endpoints)
3. [User Management](#user-management)
4. [Item Management](#item-management)
5. [Location Management](#location-management)
6. [SKU/Inventory Management](#sku-inventory-management)
7. [Scanner Operations](#scanner-operations)
8. [Logging](#logging)
9. [Alerts](#alerts)
10. [Shopping Lists](#shopping-lists)
11. [Backup & Restore](#backup--restore)
12. [Health Check](#health-check)
13. [Error Codes](#error-codes)
14. [Environment Configuration](#environment-configuration)

---

## Authentication

The Stocky Backend API supports two authentication methods:

### JWT Bearer Token Authentication
\`\`\`http
Authorization: Bearer <jwt_token>
\`\`\`

### API Key Authentication
\`\`\`http
X-API-Key: <api_key>
\`\`\`

### Persistent Sessions
For improved user experience, the API supports persistent login sessions:

- **Regular sessions**: 7-day refresh token expiration
- **Persistent sessions**: 30-day expiration with HTTP-only cookies
- **"Remember me"**: Enable by setting \`remember_me: true\` in login requests
- **Automatic refresh**: Cookie-based sessions automatically refresh without user intervention
- **Security**: HTTP-only cookies prevent XSS attacks, SameSite protection against CSRF

### User Roles
- **ADMIN**: Full access to all endpoints including user management
- **USER**: Access to their own data and shared items
- **READONLY**: View-only access to inventory data

---

## Authentication Endpoints

### POST /api/v1/auth/login

Authenticate a user and obtain JWT tokens.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false
}
\`\`\`

**Response:**
\`\`\`json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 604800
}
\`\`\`

---

### POST /api/v1/auth/refresh

Refresh access token using refresh token.

---

### POST /api/v1/auth/logout

Logout the current user.

---

## User Management

### GET /api/v1/users

List all users (Admin only).

**Response:**
\`\`\`json
{
  "users": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER"
    }
  ]
}
\`\`\`

### GET /api/v1/users/{user_id}

Get user details.

### PATCH /api/v1/users/{user_id}

Update user details (Admin only).

### DELETE /api/v1/users/{user_id}

Delete user (Admin only).

---

## Item Management

### GET /api/v1/items

List all items.

**Query Parameters:**
- \`page\` - Page number (default: 1)
- \`limit\` - Items per page (default: 100)
- \`search\` - Search term
- \`category\` - Filter by category

**Response:**
\`\`\`json
{
  "items": [
    {
      "id": "uuid",
      "name": "Milk",
      "category": "Dairy",
      "quantity": 2,
      "unit": "liters",
      "barcode": "1234567890",
      "upc": "123456789012",
      "min_level": 1,
      "max_level": 10,
      "expiry_date": "2025-12-31"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 100,
    "total": 50
  }
}
\`\`\`

### POST /api/v1/items

Create a new item.

### GET /api/v1/items/{item_id}

Get item details.

### PATCH /api/v1/items/{item_id}

Update item.

### DELETE /api/v1/items/{item_id}

Delete item.

---

## Location Management

### GET /api/v1/locations

List all locations.

**Response:**
\`\`\`json
{
  "locations": [
    {
      "id": "uuid",
      "name": "Pantry",
      "description": "Main kitchen pantry"
    }
  ]
}
\`\`\`

### POST /api/v1/locations

Create a new location.

### GET /api/v1/locations/{location_id}

Get location details.

### PATCH /api/v1/locations/{location_id}

Update location.

### DELETE /api/v1/locations/{location_id}

Delete location.

### POST /api/v1/locations/{location_id}/move-items

Move items to a location.

---

## SKU/Inventory Management

### GET /api/v1/skus

List all SKUs (inventory items).

### POST /api/v1/skus

Create a new SKU.

### GET /api/v1/skus/{sku_id}

Get SKU details.

### PATCH /api/v1/skus/{sku_id}

Update SKU.

### DELETE /api/v1/skus/{sku_id}

Delete SKU.

### POST /api/v1/skus/{sku_id}/adjust

Adjust inventory quantity.

### GET /api/v1/skus/{sku_id}/history

Get inventory history.

---

## Scanner Operations

### POST /api/v1/scanner/scan

Scan a barcode.

**Request Body:**
\`\`\`json
{
  "barcode": "1234567890",
  "upc": "123456789012"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "item": {
    "id": "uuid",
    "name": "Milk",
    "quantity": 2,
    "location": "Pantry"
  }
}
\`\`\`

---

## Logging

### GET /api/v1/logs

Get system logs.

---

## Alerts

### GET /api/v1/alerts

List all alerts.

### POST /api/v1/alerts

Create a new alert.

### DELETE /api/v1/alerts/{alert_id}

Delete an alert.

---

## Shopping Lists

### GET /api/v1/lists

List all shopping lists.

### POST /api/v1/lists

Create a new shopping list.

### GET /api/v1/lists/{list_id}

Get shopping list details.

### PATCH /api/v1/lists/{list_id}

Update shopping list.

### DELETE /api/v1/lists/{list_id}

Delete shopping list.

### POST /api/v1/lists/{list_id}/items

Add items to shopping list.

### PATCH /api/v1/lists/{list_id}/items/{item_id}

Update item in shopping list.

### DELETE /api/v1/lists/{list_id}/items/{item_id}

Remove item from shopping list.

---

## Backup & Restore

### POST /api/v1/backup

Create backup.

### GET /api/v1/backup/{backup_id}

Get backup details.

### POST /api/v1/restore/{backup_id}

Restore from backup.

---

## Health Check

### GET /api/v1/health

Check API health status.

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2025-08-30T12:00:00Z",
  "version": "0.1.0"
}
\`\`\`

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

## Environment Configuration

The backend supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| \`DATABASE_URL\` | \`sqlite:///stocky.db\` | Database connection string |
| \`SECRET_KEY\` | (required) | Secret key for JWT tokens |
| \`ALGORITHM\` | \`HS256\` | JWT algorithm |
| \`ACCESS_TOKEN_EXPIRE_MINUTES\` | \`604800\` | Access token expiration |
| \`REFRESH_TOKEN_EXPIRE_MINUTES\` | \`604800\` | Refresh token expiration |
| \`LOG_LEVEL\` | \`DEBUG\` | Logging level |
| \`DEBUG\` | \`false\` | Enable debug mode |
| \`ALLOWED_HOSTS\` | \`*\` | Allowed CORS origins |

---

**Generated on:** \${new Date().toISOString()}
`;
    
    writeFileSync(OUTPUT_FILE, doc, 'utf8');
    console.log(`📝 API documentation generated: ${OUTPUT_FILE}`);
}

export { generateApiDocs, generateStaticDocs };