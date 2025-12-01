# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for your HardwareApp.

## Prerequisites
- A Supabase project
- A Google Cloud Platform account

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name, user support email, and developer contact
   - Add scopes: `email`, `profile`, `openid` (these are usually pre-selected)
   - Add test users if needed
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   Replace `[YOUR-PROJECT-REF]` with your Supabase project reference ID (found in your Supabase project URL)

8. Click **Create**
9. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to **Authentication** > **Providers**
4. Find **Google** in the list and toggle it **ON**
5. Paste your Google **Client ID** and **Client Secret**
6. Click **Save**

## Step 3: Test the Integration

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your app in a browser
3. Click the admin button to open the login modal
4. Click **Sign in with Google**
5. You should be redirected to Google's consent screen
6. After authorizing, you'll be redirected back to your app
7. You should now be logged in and see the upload form

## Troubleshooting

### "Popup blocked" error
- Make sure popup blockers are disabled for your local development URL
- Try using Chrome in incognito mode

### "Redirect URI mismatch" error
- Verify the redirect URI in Google Cloud Console matches exactly:
  `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
- Make sure there are no trailing slashes

### OAuth login works but user can't access upload form
- Check browser console for errors
- Verify that the `onAuthStateChange` listener is firing
- Check that your user has the correct permissions in Supabase

### "Invalid OAuth client" error
- Double-check that your Client ID and Client Secret are correct in Supabase
- Ensure the Google OAuth consent screen is properly configured

## Security Notes

> [!IMPORTANT]
> - Never commit your `.env` file containing real credentials to version control
> - The `.env.example` file should only contain placeholder values
> - In production, make sure to add your production domain to Google's authorized redirect URIs
> - Review Google's OAuth policies to ensure compliance

## Production Deployment

When deploying to production:

1. Add your production domain to authorized redirect URIs in Google Cloud Console:
   ```
   https://your-production-domain.com
   ```

2. Update your Supabase site URL in **Authentication** > **URL Configuration**

3. Ensure your production environment has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
