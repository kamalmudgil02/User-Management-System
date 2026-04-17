# Deployment Guide

This guide will walk you through deploying the User Management System to Netlify (frontend) and Render (backend).

## Prerequisites

- GitHub account with your code pushed
- MongoDB Atlas account with database set up
- Netlify account (free tier works)
- Render account (free tier works)

## Step 1: Deploy Backend to Render

### 1.1 Create Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** button
3. Select **"Web Service"**
4. Click **"Connect account"** to link your GitHub
5. Select your repository: `User-Management-System`
6. Click **"Connect"**

### 1.2 Configure Service

Fill in the following settings:

- **Name**: `user-management-api` (or your preferred name)
- **Region**: Oregon (US West) or closest to you
- **Branch**: `main`
- **Root Directory**: `server`
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

### 1.3 Add Environment Variables

Click **"Advanced"** and add these environment variables:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | Generate a secure random string (min 32 characters) |
| `JWT_EXPIRES_IN` | `7d` |
| `CLIENT_URL` | Leave empty for now (will add after Netlify deployment) |

**MongoDB URI Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 1.4 Deploy

1. Click **"Create Web Service"**
2. Wait for deployment (takes 2-5 minutes)
3. Once deployed, copy your service URL: `https://your-app-name.onrender.com`

### 1.5 Test Backend

Visit: `https://your-app-name.onrender.com/api/health`

You should see:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Step 2: Deploy Frontend to Netlify

### 2.1 Create New Site

1. Go to [Netlify](https://app.netlify.com/)
2. Click **"Add new site"**
3. Select **"Import an existing project"**
4. Choose **"Deploy with GitHub"**
5. Authorize Netlify to access your GitHub
6. Select your repository: `User-Management-System`

### 2.2 Configure Build Settings

- **Base directory**: `client`
- **Build command**: `npm run build`
- **Publish directory**: `client/dist`
- **Branch to deploy**: `main`

### 2.3 Add Environment Variable

Click **"Show advanced"** and add:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-app-name.onrender.com/api` |

Replace `your-app-name` with your actual Render service name.

### 2.4 Deploy

1. Click **"Deploy site"**
2. Wait for deployment (takes 1-3 minutes)
3. Once deployed, copy your site URL: `https://your-site-name.netlify.app`

### 2.5 Update Site Name (Optional)

1. Go to **Site settings** > **General** > **Site details**
2. Click **"Change site name"**
3. Enter a custom name: `user-management-system` (if available)
4. Your new URL: `https://user-management-system.netlify.app`

## Step 3: Update Backend Configuration

### 3.1 Add Client URL to Render

1. Go back to your Render dashboard
2. Select your web service
3. Go to **"Environment"** tab
4. Update `CLIENT_URL` variable with your Netlify URL:
   ```
   https://your-site-name.netlify.app
   ```
5. Click **"Save Changes"**
6. Service will automatically redeploy

## Step 4: Configure MongoDB Atlas

### 4.1 Update Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Select your cluster
3. Click **"Network Access"** in the left sidebar
4. Click **"Add IP Address"**
5. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
6. Click **"Confirm"**

**Note:** For production, you should whitelist only Render's IP ranges for better security.

### 4.2 Verify Database Connection

Check your Render logs to ensure MongoDB connection is successful:
```
✅ MongoDB Connected: cluster0.tueadbc.mongodb.net
```

## Step 5: Test Deployment

### 5.1 Test Backend

Visit your Render URL:
```
https://your-app-name.onrender.com/api/health
```

### 5.2 Test Frontend

1. Visit your Netlify URL: `https://your-site-name.netlify.app`
2. Try logging in with demo credentials:
   - Email: `superadmin@example.com`
   - Password: `admin123`

### 5.3 Test Full Flow

1. Login as admin
2. Create a new user
3. Check if data persists
4. Test user management features
5. Check activity logs

## Step 6: Seed Database (If Needed)

If you need to seed the database with demo users:

1. Connect to your Render service shell:
   - Go to Render dashboard
   - Select your service
   - Click **"Shell"** tab
   - Run: `cd server && node seed.js`

Or run locally with production database:
```bash
cd server
MONGODB_URI="your-production-mongodb-uri" node seed.js
```

## Troubleshooting

### Issue: CORS Error

**Solution:** Ensure `CLIENT_URL` in Render matches your Netlify URL exactly (no trailing slash).

### Issue: MongoDB Connection Failed

**Solutions:**
- Verify MongoDB URI is correct
- Check Network Access allows 0.0.0.0/0
- Ensure database user has read/write permissions

### Issue: 404 on Frontend Routes

**Solution:** Netlify redirects are configured in `netlify.toml`. Ensure the file is in your repository root.

### Issue: Environment Variables Not Working

**Solutions:**
- Redeploy after adding environment variables
- Check variable names match exactly (case-sensitive)
- For Netlify, ensure variables start with `VITE_`

### Issue: Render Service Sleeping (Free Tier)

**Note:** Free tier services sleep after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

**Solution:** Consider upgrading to paid tier or use a service like UptimeRobot to ping your API every 10 minutes.

## Post-Deployment Checklist

- [ ] Backend health check returns 200
- [ ] Frontend loads without errors
- [ ] Login works with demo credentials
- [ ] User creation works
- [ ] User updates are saved
- [ ] Activity logs are recorded
- [ ] Export functionality works
- [ ] All dashboard charts display correctly
- [ ] MongoDB Atlas shows active connections
- [ ] CORS is configured correctly

## Monitoring

### Render Logs

View real-time logs:
1. Go to Render dashboard
2. Select your service
3. Click **"Logs"** tab

### Netlify Logs

View deployment logs:
1. Go to Netlify dashboard
2. Select your site
3. Click **"Deploys"** tab
4. Click on a deploy to see logs

## Updating Deployment

### Update Backend

1. Push changes to GitHub
2. Render automatically redeploys from `main` branch

### Update Frontend

1. Push changes to GitHub
2. Netlify automatically rebuilds and redeploys

### Manual Redeploy

**Render:**
- Click **"Manual Deploy"** > **"Deploy latest commit"**

**Netlify:**
- Go to **"Deploys"** > **"Trigger deploy"** > **"Deploy site"**

## Custom Domain (Optional)

### Add Custom Domain to Netlify

1. Go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow DNS configuration instructions

### Add Custom Domain to Render

1. Go to **"Settings"** > **"Custom Domain"**
2. Add your domain
3. Update DNS records as instructed

## Security Recommendations

1. **Use Strong JWT Secret**: Generate a cryptographically secure random string
2. **Restrict MongoDB Access**: Whitelist only Render IP ranges instead of 0.0.0.0/0
3. **Enable HTTPS**: Both Netlify and Render provide free SSL certificates
4. **Rotate Secrets**: Regularly update JWT_SECRET and database passwords
5. **Monitor Logs**: Regularly check for suspicious activity
6. **Rate Limiting**: Consider adding rate limiting middleware for production

## Cost Considerations

### Free Tier Limits

**Render:**
- 750 hours/month (enough for 1 service running 24/7)
- Service sleeps after 15 minutes of inactivity
- 512 MB RAM
- Shared CPU

**Netlify:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

**MongoDB Atlas:**
- 512 MB storage
- Shared cluster
- No credit card required

## Support

If you encounter issues:
- Check Render logs for backend errors
- Check browser console for frontend errors
- Verify all environment variables are set correctly
- Ensure MongoDB Atlas is accessible

## Live URLs

After deployment, update your README with:

- **Frontend**: https://your-site-name.netlify.app
- **Backend**: https://your-app-name.onrender.com
- **API Health**: https://your-app-name.onrender.com/api/health
