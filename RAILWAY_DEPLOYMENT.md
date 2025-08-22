# 🚀 Railway Backend Deployment Guide

## 📋 Prerequisites

1. **GitHub Account** ✅ (You have this)
2. **Railway Account** (Free to create)
3. **MongoDB Atlas Account** (Free tier available)

## 🔧 Step 1: Create MongoDB Atlas Database (Free)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. **Sign up for free** (no credit card required)
3. **Create a new cluster** (M0 Free tier)
4. **Create database user** (remember username/password)
5. **Get connection string** (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)
6. **Whitelist IP addresses** (add `0.0.0.0/0` for Railway)

## 🚂 Step 2: Deploy to Railway

### 2.1 Create Railway Account
1. Go to [Railway.app](https://railway.app)
2. **Sign in with GitHub** (recommended)
3. **Verify your account** (check email)

### 2.2 Deploy Your App
1. **Click "New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**: `ragner01/Real-Time-Analytics-Dashboard`
4. **Select branch**: `main`
5. **Click "Deploy"**

### 2.3 Configure Environment Variables
In Railway dashboard, go to your project → Variables tab:

```bash
# Required Variables
MONGODB_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE_NAME=AnalyticsDashboard
FRONTEND_URL=https://your-netlify-app.netlify.app

# Railway automatically sets:
PORT=8080 (or similar)
```

### 2.4 Get Your Backend URL
1. **Go to Settings tab**
2. **Copy the generated domain** (looks like: `https://your-app-name-production.up.railway.app`)

## 🔄 Step 3: Update Frontend Configuration

### 3.1 Update Netlify Redirects
Replace the content in `ClientApp/public/_redirects`:

```bash
# Handle client-side routing
/*    /index.html   200

# Proxy API calls to your Railway backend
/api/*  https://your-app-name-production.up.railway.app/api/:splat  200
/analyticsHub  https://your-app-name-production.up.railway.app/analyticsHub  200
```

### 3.2 Update Environment Variables
In Netlify dashboard → Site settings → Environment variables:

```bash
REACT_APP_API_URL=https://your-app-name-production.up.railway.app/api
REACT_APP_SIGNALR_URL=https://your-app-name-production.up.railway.app/analyticsHub
```

## 🎯 Step 4: Test Your Full-Stack App

1. **Backend**: Visit your Railway URL + `/swagger`
2. **Frontend**: Visit your Netlify URL
3. **Test real-time features**: Create metrics, generate reports
4. **Verify API calls**: Check browser network tab

## 💰 Cost Breakdown

| Service | Plan | Monthly Cost |
|---------|------|--------------|
| **Railway** | Free Tier | $0 (includes $5 credit) |
| **MongoDB Atlas** | M0 Free | $0 |
| **Netlify** | Free Tier | $0 |
| **Total** | | **$0** |

## 🆘 Troubleshooting

### Common Issues:

1. **Build fails**: Check Railway build logs
2. **Database connection error**: Verify MongoDB connection string
3. **CORS errors**: Check allowed origins in appsettings
4. **Port binding**: Railway sets PORT automatically

### Debug Commands:

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables

# Restart deployment
railway up
```

## 🚀 Next Steps After Deployment

1. **Monitor Railway dashboard** for performance
2. **Set up custom domain** (optional)
3. **Configure auto-scaling** (if needed)
4. **Set up monitoring** and alerts

## 📱 Your App URLs

- **Frontend**: `https://your-netlify-app.netlify.app`
- **Backend API**: `https://your-app-name-production.up.railway.app`
- **API Docs**: `https://your-app-name-production.up.railway.app/swagger`
- **SignalR Hub**: `https://your-app-name-production.up.railway.app/analyticsHub`

## 🎉 Success!

Your full-stack Real-Time Analytics Dashboard is now:
- ✅ **Frontend**: Deployed on Netlify
- ✅ **Backend**: Deployed on Railway
- ✅ **Database**: Hosted on MongoDB Atlas
- ✅ **Real-time**: Fully functional with SignalR
- ✅ **Cost**: $0 monthly

Ready to showcase your professional full-stack application! 🚀
