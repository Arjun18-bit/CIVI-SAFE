# 🚀 CiviSafe Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Full Stack)
1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Your app will be live at:** `https://your-app-name.vercel.app`

### Option 2: Netlify (Static Frontend)
1. **Go to [netlify.com](https://netlify.com)**
2. **Drag and drop** your `index.html` file
3. **Get instant URL:** `https://your-app-name.netlify.app`

### Option 3: Render.com (Full Stack)
1. **Connect your GitHub repository**
2. **Choose "Web Service"**
3. **Set build command:** `npm install`
4. **Set start command:** `npm start`
5. **Deploy!**

## Environment Variables

For production, set these environment variables:

```env
NODE_ENV=production
JWT_SECRET=your-super-secure-jwt-secret
PORT=3001
```

## Database Setup

### Local Development
- Uses JSON files in `database/` folder
- No additional setup required

### Production
- Consider using PostgreSQL or MongoDB
- Update database connection in `server.js`

## Security Considerations

1. **Change default passwords** in `database/users.json`
2. **Use strong JWT secrets**
3. **Enable HTTPS** (automatic on Vercel/Netlify)
4. **Set up rate limiting** for production

## Features Available

✅ **Admin Login System**
- Username: `admin`
- Password: `admin123`

✅ **User Complaint Submission**
- Anonymous complaint submission
- File upload support
- Tracking tokens

✅ **Admin Dashboard**
- View all complaints
- Update complaint status
- Statistics dashboard

✅ **Complaint Tracking**
- Track by token
- Real-time status updates

## Support

For deployment issues:
1. Check the console logs
2. Verify environment variables
3. Ensure all dependencies are installed

## Local Development

```bash
# Install dependencies
npm install

# Start server
npm start

# Access at http://localhost:3001
``` 