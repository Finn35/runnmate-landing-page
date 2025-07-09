# 🚀 Production Deployment Guide

## Switching from Localhost to Production Domain

When you deploy RUNNMATE to your production domain, you'll need to update your Strava app configuration and environment variables.

### 🔧 **What Needs to Change**

#### 1. **Strava App Settings** (Critical!)

Go to [Strava App Settings](https://www.strava.com/settings/api) and update:

```diff
- Website: http://localhost:3000
+ Website: https://yourdomain.com

- Authorization Callback Domain: localhost  
+ Authorization Callback Domain: yourdomain.com
```

**⚠️ Important Notes:**
- Use `https://` for production (Strava requires HTTPS for production apps)
- Don't include `www.` in the callback domain unless your app specifically uses it
- No trailing slashes or paths in the callback domain

#### 2. **Environment Variables**

Update your production `.env` file:

```bash
# Development (.env.local)
STRAVA_CLIENT_ID=your_client_id
STRAVA_CLIENT_SECRET=your_client_secret  
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# Production (.env.production)
STRAVA_CLIENT_ID=your_client_id  # Same ID
STRAVA_CLIENT_SECRET=your_client_secret  # Same secret
STRAVA_REDIRECT_URI=https://yourdomain.com/api/strava/callback
```

### 🔄 **Deployment Options**

#### **Option 1: Single App (Recommended for small projects)**
Use the same Strava app for both dev and production:

1. **Update Strava app settings** to production domain
2. **Update all environment variables** to production URLs
3. **Development work** requires temporarily switching back to localhost

#### **Option 2: Separate Apps (Recommended for production)**
Create separate Strava apps for development and production:

**Development App:**
- Website: `http://localhost:3000`
- Callback Domain: `localhost`
- Client ID: `dev_client_id`

**Production App:**
- Website: `https://yourdomain.com`
- Callback Domain: `yourdomain.com`  
- Client ID: `prod_client_id`

### 📋 **Step-by-Step Deployment**

#### **For Option 1 (Single App):**

1. **Update Strava App:**
   ```
   Website: https://yourdomain.com
   Authorization Callback Domain: yourdomain.com
   ```

2. **Update Production Environment:**
   ```bash
   STRAVA_REDIRECT_URI=https://yourdomain.com/api/strava/callback
   ```

3. **Deploy your app**

4. **Test OAuth flow:**
   ```
   https://yourdomain.com/profile
   # Click "Connect Strava" to test
   ```

#### **For Option 2 (Separate Apps):**

1. **Create new Strava app** for production
2. **Set production environment variables:**
   ```bash
   STRAVA_CLIENT_ID=prod_client_id
   STRAVA_CLIENT_SECRET=prod_client_secret
   STRAVA_REDIRECT_URI=https://yourdomain.com/api/strava/callback
   ```
3. **Keep development unchanged**
4. **Deploy and test**

### 🔐 **OAuth URL Updates**

Your OAuth URLs will change from:
```bash
# Development
https://www.strava.com/oauth/authorize?client_id=DEV_ID&redirect_uri=http://localhost:3000/api/strava/callback&scope=read,activity:read

# Production  
https://www.strava.com/oauth/authorize?client_id=PROD_ID&redirect_uri=https://yourdomain.com/api/strava/callback&scope=read,activity:read
```

### 🧪 **Testing Production OAuth**

1. **Test the flow:**
   ```
   https://yourdomain.com/profile
   ```

2. **Check callback handling:**
   - Click "Connect Strava"
   - Should redirect to Strava
   - After authorization, should return to your domain
   - Should show verification badge

3. **Common issues:**
   - **Callback domain mismatch** → Update Strava app settings
   - **HTTPS required** → Ensure production uses HTTPS
   - **CORS errors** → Check your domain configuration

### 🌍 **Environment-Specific Configuration**

```javascript
// lib/config.js
const config = {
  development: {
    stravaRedirectUri: 'http://localhost:3000/api/strava/callback',
    baseUrl: 'http://localhost:3000'
  },
  production: {
    stravaRedirectUri: 'https://yourdomain.com/api/strava/callback', 
    baseUrl: 'https://yourdomain.com'
  }
}

export default config[process.env.NODE_ENV || 'development']
```

### 🚨 **Common Deployment Issues**

#### **"redirect_uri_mismatch" Error**
```bash
# Fix: Exact match required
Strava App Setting: yourdomain.com
Actual Redirect: https://yourdomain.com/api/strava/callback
✅ Callback domain should be: yourdomain.com
```

#### **"Invalid Client" Error**
- Wrong Client ID/Secret for environment
- Check you're using production credentials

#### **HTTPS Required**
```bash
# Development (OK)
http://localhost:3000

# Production (Required)  
https://yourdomain.com
```

### 📦 **Deployment Checklist**

- [ ] **Strava app settings updated** to production domain
- [ ] **Environment variables** set for production
- [ ] **HTTPS enabled** on production domain
- [ ] **Database migrated** to production
- [ ] **OAuth flow tested** end-to-end
- [ ] **Callback URL matches** exactly
- [ ] **Remove development tools** (`/strava-test.html`, `/strava-oauth-helper.html`)

### 🔄 **Rollback Plan**

If something goes wrong:

1. **Revert Strava app settings** to localhost
2. **Check environment variables** are correct
3. **Test locally** before trying production again
4. **Use separate apps** to avoid this issue

### 💡 **Pro Tips**

1. **Use staging environment** to test domain changes first
2. **Keep development tokens** separate from production
3. **Document your settings** for future reference
4. **Consider using environment-specific Strava apps**
5. **Test OAuth flow thoroughly** before going live

---

## 🎯 **Example: yourdomain.com → runnmate.com**

```bash
# Old Settings (Development)
Website: http://localhost:3000
Callback Domain: localhost
Redirect URI: http://localhost:3000/api/strava/callback

# New Settings (Production)  
Website: https://runnmate.com
Callback Domain: runnmate.com
Redirect URI: https://runnmate.com/api/strava/callback
```

The key is that **everything must match exactly** - Strava is very strict about callback URLs! 