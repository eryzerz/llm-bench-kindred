# Next.js App Deployment to Vercel

This is a Next.js application configured for easy deployment to Vercel.

## Deployment Instructions

### Option 1: One-Click Deployment

1. Push your code to a GitHub, GitLab, or Bitbucket repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure your project:
   - Framework Preset: Next.js
   - Environment Variables: Add the following variables
     - `OPENROUTER_API_KEY` - Your OpenRouter API key
     - `APP_URL` - Your production app URL (will be provided by Vercel after deployment)
6. Click "Deploy"

### Option 2: Vercel CLI Deployment

1. Install Vercel CLI:

   ```
   npm install -g vercel
   ```

2. Log in to Vercel:

   ```
   vercel login
   ```

3. Deploy the application:

   ```
   vercel
   ```

4. Add environment variables:

   ```
   vercel env add OPENROUTER_API_KEY
   vercel env add APP_URL
   ```

5. For production deployment:
   ```
   vercel --prod
   ```

## Development

```
npm run dev
```

## Build

```
npm run build
```

## Start

```
npm start
```
