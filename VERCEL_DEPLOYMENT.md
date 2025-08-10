# Vercel Deployment Instructions

## Steps to Deploy on Vercel:

1. **Push your code to GitHub** (which you've already done)

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Import your `VedicVogue-Backend` repository

3. **Configure Environment Variables in Vercel:**
   - Go to your project settings in Vercel
   - Add all your environment variables from your `.env` file:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `COOKIE_SECRET`
     - `FRONTEND_URL`
     - `ADMIN_URL`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `EMAIL_USER`
     - `EMAIL_PASS`
     - Any other environment variables you use

4. **Deploy:**
   - Vercel will automatically build and deploy
   - Your API will be available at: `https://your-project-name.vercel.app`

## API Endpoints:
- Base URL: `https://your-project-name.vercel.app`
- Health check: `https://your-project-name.vercel.app/health`
- API routes: `https://your-project-name.vercel.app/api/*`

## Files Added for Vercel:
- `vercel.json` - Vercel configuration
- `api/index.ts` - Vercel serverless function entry point
- `.vercelignore` - Files to exclude from deployment

## Note:
Make sure to update your frontend and admin panel URLs to point to the new Vercel deployment URL.
