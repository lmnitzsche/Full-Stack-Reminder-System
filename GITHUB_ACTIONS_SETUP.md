# GitHub Actions Deployment Setup

This will automatically deploy your app when you push to the `main` branch.

## Step 1: Get Supabase Access Token

1. Go to https://supabase.com/dashboard/account/tokens
2. Click "Generate New Token"
3. Name it: "GitHub Actions"
4. Copy the token (starts with `sbp_...`)

## Step 2: Add Secrets to GitHub

1. Go to your GitHub repo: https://github.com/lmnitzsche/Full-Stack-Reminder-System
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret" and add these FOUR secrets:

**Secret 1:**
- Name: `SUPABASE_ACCESS_TOKEN`
- Value: `sbp_...` (the token you just copied)

**Secret 2:**
- Name: `SUPABASE_PROJECT_ID`
- Value: `gunwklwxcvayboxjmraz`

**Secret 3:**
- Name: `VITE_SUPABASE_URL`
- Value: `https://gunwklwxcvayboxjmraz.supabase.co`

**Secret 4:**
- Name: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bndrbHd4Y3ZheWJveGptcmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0Mzg4NjUsImV4cCI6MjA3NzAxNDg2NX0.iASkcEMOQhtvLlW-PEc9KYCZx1QvgU49-kkK523d5ic`

## Step 3: Enable GitHub Pages

1. In your repo, go to "Settings" → "Pages"
2. Under "Source", select: **GitHub Actions**
3. Save

## Step 4: Update vite.config.js

In `vite.config.js`, make sure the `base` matches your repo name:
```javascript
base: '/task-tracker/', // Should match your GitHub repo name
```

## Step 5: Push to GitHub

```bash
git add .
git commit -m "Add GitHub Actions deployment"
git push origin main
```

## What Happens Next:

1. **GitHub Actions will run automatically**
   - Builds your app
   - Deploys Supabase functions
   - Deploys frontend to GitHub Pages

2. **Your app will be live at:**
   - `https://lmnitzsche.github.io/task-tracker/`

3. **Every time you push to `main`:**
   - Supabase functions auto-deploy
   - Frontend auto-deploys
   - No manual commands needed!

## Check Deployment Status:

- Go to: https://github.com/lmnitzsche/task-tracker/actions
- You'll see the deployment progress
- Green checkmark = deployed successfully!

## Custom Domain Setup (Optional):

If you want to use your own domain (e.g., `yourdomain.com`):

1. **In GitHub Pages settings:**
   - Enter your custom domain
   - Enable "Enforce HTTPS"

2. **In your domain DNS (GoDaddy):**
   - Add CNAME record:
     - Name: `www` or `@`
     - Value: `lmnitzsche.github.io`
   - Or A records pointing to GitHub's IPs

3. **Update vite.config.js:**
   ```javascript
   base: '/', // Root path for custom domain
   ```

## Troubleshooting:

- **Build fails?** Check the Actions tab for error logs
- **Page not loading?** Make sure GitHub Pages source is set to "GitHub Actions"
- **Functions not deploying?** Verify Supabase secrets are set correctly

---

That's it! Push to `main` and watch it deploy automatically! 🚀
