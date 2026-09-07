# Google OAuth Setup Guide for ShopStrock

This guide will help you set up Google OAuth authentication for login and registration.

## Prerequisites

- Google Cloud Console account
- Supabase account
- Your application's deployed URL for production, or `http://localhost:5173` for development
- If there is a new domain or callback URL, make sure it is added in both Google Cloud and Supabase

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Go to **APIs & Services** > **OAuth consent screen**
4. Configure the consent screen:
   - Select **External** as the User Type
   - Fill in the required application information
   - Add your email address as a test user

## Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Web application**
4. Add authorized redirect URIs. At minimum, include:
   ```
   http://localhost:5173
   https://your-supabase-project.supabase.co/auth/v1/callback
   ```
   - If you have a new domain or new app callback URL, add it here too.
   - Example: `https://shop.example.com` or `https://shop.example.com/auth/callback`
5. Copy the **Client ID** and **Client Secret** from Google Cloud.

## Step 3: Configure in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Providers**
3. Find **Google** and enable it
4. Paste your **Client ID** and **Client Secret** from Google Cloud
5. Set the redirect URL in Supabase if prompted
   - Supabase usually suggests a callback like `https://<project>.supabase.co/auth/v1/callback`
   - If you use a custom domain, add that URL too
6. Save the configuration

## Step 4: Environment Variables

สำหรับ Google OAuth และ Supabase frontend authentication ให้ใส่ค่าเหล่านี้ในไฟล์ `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_UNSPLASH_ACCESS_KEY=Access Key / unsplash.com
```

> หมายเหตุ: ในไฟล์ `.env` ของ frontend ไม่ควรใส่ `SUPABASE_SERVICE_ROLE_KEY` เพราะเป็นคีย์ความลับสำหรับ server-side เท่านั้น

### ค่าที่ใช้จริงสำหรับ Google OAuth

- `VITE_SUPABASE_URL`
  - มาจากหน้า Supabase Project Settings > API
  - เป็น URL ของโปรเจค Supabase ของคุณ
- `VITE_SUPABASE_ANON_KEY`
  - มาจากหน้า Supabase Project Settings > API > Project API keys
  - เป็นคีย์สำหรับ frontend ที่ใช้เรียก auth และ storage ในแอปของคุณ

### ค่าที่เกี่ยวข้องกับ app แต่ไม่ใช่ Google OAuth โดยตรง

- `VITE_UNSPLASH_ACCESS_KEY`
  - เป็นคีย์สำหรับบริการ Unsplash ในการดึงรูปภาพ
  - ถ้าแอปของคุณใช้การสร้างรูปจาก Unsplash จะต้องใส่ค่า
  - ถ้าแค่ต้องการทำ Google OAuth ก็ไม่จำเป็นต้องมีค่านี้
- `SUPABASE_SERVICE_ROLE_KEY`
  - เป็นคีย์ความลับของ Supabase สำหรับ server-side
  - ต้องเก็บไว้ในฝั่ง server หรือ secret store เท่านั้น
  - ห้ามใส่ใน frontend `.env` หรือ commit ขึ้น Git

### ที่มาของ Google OAuth และ Redirect URL

- `Client ID` และ `Client Secret`
  - มาจาก Google Cloud Console > APIs & Services > Credentials
  - คัดลอกค่ามาวางใน Supabase Authentication > Providers > Google
- `Authorized redirect URIs`
  - ต้องเพิ่มทั้งใน Google Cloud Console และใน Supabase
  - ถ้าเพิ่มลิงก์ใหม่ ต้องลงทะเบียนในทั้ง 2 ที่
  - ถ้าไม่ตรงกัน จะเกิดข้อผิดพลาด `Redirect URL mismatch`

## Step 5: Test the Implementation

1. Run your development server:
   ```bash
   npm run dev
   ```
2. Go to the login page
3. Click **Sign in with Google** button
4. You should be redirected to Google's login
5. After authentication, you'll be redirected back to your application

## How It Works

### Login Flow

```
User clicks "Sign in with Google"
  ↓
Redirected to Google login
  ↓
User authenticates with Google
  ↓
Redirected to Supabase callback URL
  ↓
Supabase creates/updates user session
  ↓
Redirected back to your app
```

### Registration Flow

```
User clicks "Sign up with Google"
  ↓
Same as login flow - Supabase automatically creates an account
  ↓
User is registered and logged in
```

## Key Features Implemented

✅ **Login with Google** - Existing users can sign in
✅ **Register with Google** - New users can create accounts
✅ **Automatic User Creation** - Supabase creates users automatically
✅ **Error Handling** - Toast notifications for errors
✅ **Loading States** - Visual feedback during authentication

## Troubleshooting

### "Redirect URL mismatch" Error
- Verify the redirect URL in Google Cloud Console matches the URL in Supabase
- Add both your development URL and production URL if needed
- If a new callback link is added, register it in both places

### "Invalid Client ID" Error
- Double-check your Client ID and Client Secret
- Ensure they are copied correctly from Google Cloud to Supabase

### OAuth popup is blocked
- This is a browser security feature
- Allow popups or use redirect-based login
- Supabase handles this with the callback flow

## Security Notes

⚠️ **Never commit credentials to version control**
- Use `.env` files (which should be in `.gitignore`)
- Use environment variables in production

⚠️ **Client Secret should only be used server-side**
- In Supabase, they handle this securely for you
- Your Supabase Anon Key is safe to expose to the frontend

## Additional Resources

- [Supabase Google OAuth Docs](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com)
- [OAuth 2.0 Specification](https://oauth.net/2/)
