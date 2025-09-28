# Nginx Proxy Manager Configuration Guide

## Problem
The Stocky Backend has strict URL pattern requirements:
- Collection endpoints must have trailing slashes: `/users/`
- Resource endpoints must NOT have trailing slashes: `/users/123`
- Multi-part paths must NOT have trailing slashes: `/users/123/profile`

When the frontend sends requests with incorrect patterns, the backend redirects them, but these redirects can downgrade HTTPS to HTTP, causing mixed content security errors.

## Solution
Configure Nginx Proxy Manager to normalize URLs before they reach the backend, preventing redirects altogether.

## Implementation Steps

### Step 1: Access Nginx Proxy Manager
1. Log into your Nginx Proxy Manager web interface
2. Navigate to "Proxy Hosts"
3. Find your Stocky Backend proxy host
4. Click the three dots menu and select "Edit"

### Step 2: Add Advanced Configuration
1. Click on the "Advanced" tab
2. In the "Custom Nginx Configuration" text area, add the configuration from `nginx-proxy-simple.conf`

### Step 3: Key Configuration Elements

```nginx
# Force HTTPS redirects to prevent mixed content
proxy_redirect http:// https://;

# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "upgrade-insecure-requests" always;

# URL normalization rules
location ~ ^/api/v1/(users|items|locations|skus|alerts|logs|shopping-lists)$ {
    return 301 https://$host$uri/$is_args$args;
}

location ~ ^/api/v1/(users|items|locations|skus|shopping-lists)/([0-9]+)/$ {
    return 301 https://$host/api/v1/$1/$2$is_args$args;
}

location ~ ^/api/v1/auth/([^/]+)/$ {
    return 301 https://$host/api/v1/auth/$1$is_args$args;
}

location ~ ^/api/v1/(.*[^/])/$ {
    return 301 https://$host/api/v1/$1$is_args$args;
}
```

### Step 4: Test Configuration
1. Click "Save" to apply the configuration
2. Test the following URLs to ensure they redirect properly:
   - `https://your-domain.com/api/v1/users` → should redirect to `/api/v1/users/`
   - `https://your-domain.com/api/v1/users/123/` → should redirect to `/api/v1/users/123`
   - `https://your-domain.com/api/v1/auth/login/` → should redirect to `/api/v1/auth/login`

### Step 5: Verify Mixed Content Resolution
1. Open your StockyWeb application
2. Open browser developer tools (F12)
3. Check the Console tab for any mixed content errors
4. Verify that all API requests use HTTPS

## Benefits

1. **Prevents Mixed Content Errors**: All redirects maintain HTTPS
2. **URL Consistency**: Automatically normalizes URLs to match backend expectations
3. **Improved Performance**: Reduces unnecessary redirects from frontend
4. **Better Security**: Enforces HTTPS and adds security headers
5. **Future-Proof**: Handles URL pattern issues at the proxy level

## Troubleshooting

If you encounter issues:

1. **Check Nginx Logs**: Look for syntax errors in the configuration
2. **Test Individual Rules**: Comment out rules one by one to isolate issues
3. **Verify Regex Patterns**: Test regex patterns against your actual URLs
4. **Monitor Traffic**: Use browser dev tools to see redirect behavior

## Alternative: Docker Compose Override

If Nginx Proxy Manager doesn't work as expected, you can also add these rules directly to the nginx.conf in your Docker setup or create a custom Nginx container with these rules.