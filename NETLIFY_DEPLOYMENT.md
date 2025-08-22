# Netlify Deployment Guide

## 🚀 Quick Fix for Broken Links

Your React app is now configured to work on Netlify! The "broken link" issue was caused by:

1. **Client-side routing** not being handled by Netlify
2. **API calls** trying to reach localhost (which doesn't exist in production)
3. **Missing redirects** for single-page application routing

## ✅ What I Fixed:

1. **Added `_redirects` file** - Handles client-side routing
2. **Added `netlify.toml`** - Netlify configuration
3. **Updated API URLs** - Automatically detects production vs development
4. **Configured fallbacks** - Shows sample data when backend is unavailable

## 🔄 Redeploy to Netlify:

1. **Commit these changes:**
   ```bash
   git add .
   git commit -m "Fix Netlify deployment: Add redirects and production config"
   git push origin main
   ```

2. **Netlify will auto-deploy** from your GitHub repository

## 🌐 Current Setup:

- **Frontend**: Deployed on Netlify ✅
- **Backend**: Still running locally (localhost:5089)
- **API Calls**: Fallback to sample data in production
- **Real-time**: Disabled in production (backend not deployed)

## 🚀 Next Steps (Optional):

### Option 1: Deploy Backend to Azure/Hero/Railway
- Deploy your ASP.NET Core backend
- Update the redirects in `_redirects` file
- Uncomment the proxy lines

### Option 2: Keep Frontend-Only (Current)
- App works with sample data
- No backend deployment needed
- Perfect for demos and portfolios

## 🔧 Environment Variables in Netlify:

If you deploy your backend later, set these in Netlify:
- `REACT_APP_API_URL` = Your backend URL
- `REACT_APP_SIGNALR_URL` = Your SignalR hub URL

## 📱 Test Your Deployment:

1. Visit your Netlify URL
2. Navigate between pages (Dashboard, Metrics, Reports, Predictions)
3. All should work with sample data
4. No more broken links! 🎉

## 🆘 Still Having Issues?

1. **Check Netlify build logs** for errors
2. **Verify `_redirects` file** is in the `public` folder
3. **Ensure `netlify.toml`** is in the root of `ClientApp`
4. **Wait for auto-deploy** after pushing changes
