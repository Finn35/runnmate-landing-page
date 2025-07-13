# 🔧 Magic Link System Troubleshooting Guide

## 🚨 **Problem: Duplicate Emails or No Emails**

If users are receiving:
- **Duplicate emails** (one from Supabase, one from Resend)
- **Only Supabase emails** (not your custom Resend emails)
- **No emails at all**

This guide will fix the issue.

## 🔍 **Root Cause Analysis**

### **The Problem**
1. **Supabase automatically sends OTP emails** when you call `signInWithOtp()`
2. **Your app ALSO sends emails** via Resend
3. **There's no built-in way to disable Supabase emails** via SDK
4. **The `skipEmailNotification` option doesn't exist** in Supabase

### **The Solution**
**Disable Supabase's email templates** in the dashboard so only your custom Resend emails are sent.

## 🛠️ **Step-by-Step Fix**

### **Step 1: Disable Supabase Email Templates**

1. **Go to your Supabase Dashboard**
2. **Navigate to:** Authentication → Email Templates
3. **For each template** (Magic Link, Confirm Signup, Invite User, Reset Password):
   - Click on the template
   - **Clear the HTML content** (delete everything)
   - **Clear the subject line** (make it empty)
   - Click **Save**

### **Step 2: Verify Your Code Structure**

Make sure you have:
- ✅ **Only ONE magic link route:** `/api/auth/send-magic-link/route.ts`
- ✅ **Proper email service:** `src/lib/email-service.ts` with Resend
- ✅ **Clean auth flow:** `src/lib/supabase.ts` with `sendMagicLink` function

### **Step 3: Test the Flow**

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Test the magic link flow:**
   - Go to `/login`
   - Enter your email
   - Click "Send Magic Link"
   - Check your email inbox

3. **Expected behavior:**
   - ✅ **One email** from Resend with your custom template
   - ✅ **No email** from Supabase
   - ✅ **Magic link works** when clicked

## 🔄 **Alternative Solutions**

### **Option A: Use Supabase Auth Hooks (Advanced)**

If you want to keep Supabase templates enabled but intercept emails:

1. **Set up Auth Hooks** in Supabase
2. **Intercept the email sending** event
3. **Send custom email** instead

### **Option B: Use Custom Auth Flow (Complex)**

Build a completely custom authentication system:

1. **Generate your own tokens**
2. **Store them securely**
3. **Handle verification manually**

## 📧 **Email Template Verification**

Your custom email should come from:
- **From:** Runnmate <admin@runnmate.com>
- **Subject:** Your Runnmate Login Link
- **Template:** Custom HTML with your branding

## 🐛 **Common Issues**

### **Issue 1: Still Getting Supabase Emails**
- **Solution:** Double-check that ALL email templates are cleared in Supabase dashboard
- **Template locations:** Auth → Email Templates → (Magic Link, Confirm Signup, etc.)

### **Issue 2: No Emails at All**
- **Check:** Resend API key is correct in `.env.local`
- **Check:** Email service is properly configured
- **Check:** Console logs for email sending errors

### **Issue 3: Magic Link Doesn't Work**
- **Check:** Token hash is properly extracted from Supabase response
- **Check:** Callback URL is correct
- **Check:** Auth callback page handles verification properly

## 📋 **Checklist**

- [ ] Supabase email templates cleared
- [ ] Resend API key configured
- [ ] Only one magic link route exists
- [ ] Email service logs success/failure
- [ ] Auth callback page works
- [ ] Testing with real email address

## 🔧 **Environment Variables**

Make sure you have:
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=your_resend_api_key
```

## 📞 **Still Having Issues?**

1. **Check browser console** for JavaScript errors
2. **Check server logs** for email sending errors
3. **Test with different email addresses**
4. **Verify Resend dashboard** for delivery status

## 🎯 **Expected User Flow**

1. **User enters email** on login page
2. **System generates OTP** via Supabase
3. **Custom email sent** via Resend (no Supabase email)
4. **User clicks magic link** in email
5. **User authenticated** and redirected
6. **Session established** in browser

This flow should work without any duplicate emails once Supabase templates are disabled. 