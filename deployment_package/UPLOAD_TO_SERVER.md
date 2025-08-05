# Upload Instructions for nexusmediaco.online

## The Problem
Your domain `nexusmediaco.online` is currently pointing to a server with PHP files (like `sapp-wp-signon.php`) instead of your React application. This is why you're seeing PHP errors and missing index.html.

## Solution: Upload Your React App

You have two options:

### Option 1: Upload Static Files Only (Recommended for basic hosting)

1. **Upload these files** from `client/build/` to your web server's root directory:
   - `index.html`
   - `manifest.json`
   - `static/` folder (contains CSS and JS files)
   - `asset-manifest.json`

2. **Make sure your web server** serves `index.html` for all routes (for React Router to work)

### Option 2: Full Application with Backend (Recommended for full functionality)

1. **Upload the entire project** to your server
2. **Install Node.js** on your server
3. **Run these commands** on your server:
   ```bash
   npm run install-all
   npm run build
   npm run start
   ```
4. **Configure your web server** to proxy requests to port 5000

## Files You Need to Upload

### For Static Hosting (Option 1):
```
Your Server Root/
├── index.html              (from client/build/)
├── manifest.json           (from client/build/)
├── asset-manifest.json     (from client/build/)
├── .htaccess              (for Apache/cPanel hosting)
├── .cpanel.yml            (for cPanel auto-deployment)
└── static/
    ├── css/
    │   ├── main.9088f659.css
    │   └── main.9088f659.css.map
    └── js/
        ├── main.b1aebdd7.js
        ├── main.b1aebdd7.js.LICENSE.txt
        └── main.b1aebdd7.js.map
```

### For Full Application (Option 2):
Upload the entire project folder and follow the deployment guide in `DEPLOYMENT.md`

## Important Notes

1. **Remove existing PHP files** from your server root directory
2. **The index.html and CSS files exist** - they're in the `client/build/` folder
3. **Your domain needs to point** to where you upload these files
4. **For full functionality** (login, posting, etc.), you need Option 2 with a Node.js server

## cPanel Specific Instructions

If you're using cPanel hosting:

1. **Upload via File Manager or FTP** - Upload all files from `deployment_package` to your `public_html` folder
2. **Auto-deployment** - The `.cpanel.yml` file will automatically deploy files when you push to a connected Git repository
3. **Apache configuration** - The `.htaccess` file ensures React Router works properly and adds security headers
4. **Remove existing files** - Delete any existing PHP files (like `sapp-wp-signon.php`) from `public_html`

## Quick Test
After uploading, visit `https://nexusmediaco.online` - you should see your React app instead of PHP errors.