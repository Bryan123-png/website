# Deployment Guide

## Production Deployment Steps

### 1. Environment Configuration

#### Client Environment (.env in client folder)
```
# Production API URL
REACT_APP_API_URL=https://nexusmediamanagement.online
```

#### Server Environment (.env in server folder)
```
# Server Configuration
PORT=5000
NODE_ENV=production

# Client URL for CORS
CLIENT_URL=https://nexusmediamanagement.online

# Add your database and API keys here
# DATABASE_URL=your_database_connection_string
# JWT_SECRET=your_jwt_secret_key
```

### 2. Build and Deploy

#### Option A: Manual Deployment
1. Install dependencies:
   ```bash
   npm run install-all
   ```

2. Build the client:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm run start
   ```

#### Option B: One-command Deploy
```bash
npm run deploy
```

**Note**: The production server now serves both the React app and API from a single port (5000), eliminating the need for complex web server configuration.

### 3. Web Server Configuration

#### Simple Setup (Recommended)
The application now runs as a single server that serves both the React app and API. Simply:

1. **Point your domain** to your server IP
2. **Configure SSL/HTTPS** (recommended)
3. **Proxy all traffic** to port 5000

#### Example Nginx Configuration (Simplified):
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name nexusmediamanagement.online;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Proxy all requests to the Node.js server
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Alternative: Direct Port Access
If you can't configure a reverse proxy, you can access the app directly at:
`https://nexusmediamanagement.online:5000`

### 4. DNS Configuration

Ensure your DNS records point to your server:
- **A Record**: `nexusmediamanagement.online` → Your server IP
- **CNAME Record**: `www.nexusmediamanagement.online` → `nexusmediamanagement.online`

### 5. Process Management (Recommended)

Use PM2 to keep your server running:
```bash
npm install -g pm2
cd server
pm2 start index.js --name "social-media-api"
pm2 startup
pm2 save
```

### 6. Troubleshooting

#### Common Issues:
1. **404 Error**: Check that your web server is properly configured to serve the React build files
2. **API Errors**: Verify the server is running and accessible on port 5000
3. **CORS Issues**: Ensure `CLIENT_URL` in server .env matches your domain
4. **Environment Variables**: Make sure all required .env files are in place

#### Health Check:
Visit `https://nexusmediamanagement.online/api/health` to verify the API is working.