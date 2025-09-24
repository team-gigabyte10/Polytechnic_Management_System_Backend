# Rate Limiting Configuration Guide

## Overview
This guide explains the comprehensive rate limiting solution implemented to fix the "Too many requests from this IP" error globally across the Polytechnic Management System API.

## Features Implemented

### 1. **Flexible Rate Limiting Configuration**
- **General API Routes**: 2000 requests per 15 minutes (development) / 500 requests per 15 minutes (production)
- **Authentication Routes**: 100 requests per 15 minutes (development) / 20 requests per 15 minutes (production)
- **File Upload Routes**: 50 requests per hour (development) / 10 requests per hour (production)

### 2. **Smart IP Handling**
- **Trusted IPs**: `127.0.0.1`, `::1`, `localhost` bypass rate limiting
- **User-based Limiting**: Authenticated users get separate rate limits based on user ID
- **IP-based Limiting**: Non-authenticated requests are limited by IP address

### 3. **Environment-Aware Settings**
- **Development**: More lenient limits for testing and development
- **Production**: Stricter limits for security and performance

### 4. **Enhanced Error Responses**
Rate limit exceeded responses now include:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later.",
  "retryAfter": 900,
  "limit": 2000,
  "remaining": 0,
  "resetTime": "2024-01-20T10:30:00.000Z"
}
```

## Configuration

### Environment Variables
You can customize rate limiting by setting these environment variables:

```bash
# General API rate limiting
RATE_LIMIT_WINDOW_MS=900000          # 15 minutes in milliseconds
RATE_LIMIT_MAX_REQUESTS=2000         # Max requests per window

# Authentication rate limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000     # 15 minutes in milliseconds
AUTH_RATE_LIMIT_MAX_REQUESTS=100     # Max auth requests per window

# File upload rate limiting
UPLOAD_RATE_LIMIT_WINDOW_MS=3600000  # 1 hour in milliseconds
UPLOAD_RATE_LIMIT_MAX_REQUESTS=50    # Max uploads per window
```

### Default Values
If environment variables are not set, the system uses these defaults:

| Environment | General API | Auth Routes | Upload Routes |
|-------------|-------------|-------------|---------------|
| Development | 2000/15min  | 100/15min   | 50/1hour      |
| Production  | 500/15min   | 20/15min    | 10/1hour      |

## Monitoring

### Rate Limit Status Endpoint
Check current rate limiting configuration:
```
GET /api/rate-limit-status
```

Response:
```json
{
  "success": true,
  "message": "Rate limit status",
  "limits": {
    "general": {
      "windowMs": 900000,
      "max": 2000
    },
    "auth": {
      "windowMs": 900000,
      "max": 100
    },
    "upload": {
      "windowMs": 3600000,
      "max": 50
    }
  },
  "environment": "development",
  "trustedIPs": ["127.0.0.1", "::1", "localhost"]
}
```

### Logging
- Rate limit violations are logged with IP address and endpoint
- Development mode includes detailed request logging
- Response headers include rate limit information

## Troubleshooting

### Common Issues

1. **Still getting rate limited in development?**
   - Check if your IP is in the trusted IPs list
   - Verify NODE_ENV is set to 'development'
   - Check the rate limit status endpoint

2. **Rate limits too strict for production?**
   - Adjust environment variables
   - Consider implementing user-based rate limiting
   - Add more IPs to trusted list if needed

3. **Rate limits not working?**
   - Ensure express-rate-limit is properly installed
   - Check middleware order in server.js
   - Verify environment variables are loaded

### Testing Rate Limits
```bash
# Test general API rate limiting
for i in {1..10}; do curl -X GET http://localhost:3000/api/health; done

# Test auth rate limiting
for i in {1..25}; do curl -X POST http://localhost:3000/api/auth/login -d '{"email":"test@test.com","password":"test"}'; done
```

## Security Considerations

1. **IP Spoofing**: The system uses `req.ip` which should be configured with a trusted proxy
2. **User Authentication**: Rate limits are per-user for authenticated requests
3. **Trusted IPs**: Only add trusted IPs to the bypass list
4. **Environment Variables**: Use strong, unique values in production

## Performance Impact

- **Memory Usage**: Minimal - uses in-memory storage by default
- **CPU Usage**: Negligible - simple counter operations
- **Response Time**: < 1ms additional latency per request

## Future Enhancements

1. **Redis Storage**: For distributed rate limiting across multiple servers
2. **Dynamic Limits**: Adjust limits based on server load
3. **User Tiers**: Different limits for different user roles
4. **Geographic Limits**: Different limits based on geographic location
5. **API Key Limits**: Separate limits for API key-based requests

## Support

For issues or questions about rate limiting:
1. Check the rate limit status endpoint
2. Review server logs for rate limit violations
3. Verify environment configuration
4. Test with trusted IP addresses
