# 📊 RUNNMATE Analytics System Guide

## Overview

A comprehensive analytics system has been implemented to track user behavior, listing performance, and key metrics for your MVP. This will help you make data-driven decisions about your marketplace.

## 🔐 Security & Access

### **PIN Protection**
The analytics dashboard is protected by a PIN code to keep your data secure while allowing easy access.

**Setup:**
1. Set your PIN in environment variables: `ANALYTICS_PIN=your_secure_pin_here`
2. Default PIN is `1234` (change this immediately for security!)
3. Access: Visit `http://localhost:3000/analytics` and enter your PIN
4. PIN is stored locally after successful login (until logout)

**Features:**
- ✅ **Secure access** - No public links to analytics
- ✅ **Easy login** - PIN-based authentication
- ✅ **Session management** - Stay logged in until logout
- ✅ **Logout option** - Clear access anytime

## 🎯 What's Being Tracked

### **User Actions**
- **Buy Now Clicks** - Track conversion intent
- **Contact Seller Clicks** - Track engagement 
- **Newsletter Signups** - Track marketing effectiveness
- **Strava Connections** - Track verification adoption
- **Language Changes** - Track localization preferences

### **Page Analytics** 
- **Page Views** - All page visits with time spent
- **Unique Visitors** - Distinct users per day
- **Listing Views** - Individual listing performance
- **Search Queries** - What users are looking for

### **Listing Performance**
- **Views per listing** - Which listings get attention
- **Click-through rates** - From browse to listing detail
- **Contact rates** - From viewing to contacting seller
- **Time spent** - How engaging are your listings

## 🚀 How to Access Analytics

### **Analytics Dashboard**
1. **Navigate:** Go to `http://localhost:3000/analytics`
2. **Login:** Enter your PIN code (default: `1234`)
3. **Access:** Full dashboard with real-time data

**Features:**
- **Real-time metrics** for today
- **Date range selection** (default: last 30 days)
- **Key performance indicators** with visual charts
- **Top performing listings** ranked by engagement
- **Popular search terms** to understand demand
- **Conversion rates** and user behavior insights

### **Key Metrics Displayed:**

#### Today's Snapshot
- Page views 
- Unique visitors
- Active listings
- Conversion rate (clicks → contacts)

#### Action Tracking
- Buy Now clicks (total & by period)
- Contact Seller clicks (engagement rate)
- Strava connections (verification rate)

#### Performance Insights
- **Top 5 performing listings** with view counts
- **Popular search terms** showing demand
- **Daily metrics table** with conversion trends

## 📊 Database Schema

### **Core Tables Created:**
- `analytics_events` - All user interactions
- `analytics_page_views` - Page visit tracking
- `analytics_search_queries` - Search behavior
- `analytics_daily_metrics` - Aggregated daily stats
- `analytics_listing_metrics` - Per-listing performance

### **Automatic Data Processing:**
- **Daily aggregation** of metrics
- **Real-time event tracking** 
- **Session management** for anonymous users
- **Privacy-compliant** (no PII stored)

## 🔧 Technical Implementation

### **Auto-Tracking Features:**
✅ **Page views** - Automatically tracked on all pages
✅ **Time spent** - Tracked when users leave pages  
✅ **Buy Now/Contact buttons** - Tracked on both browse and listing pages
✅ **Search queries** - Tracked with filter combinations
✅ **Language switches** - Tracked for localization insights

### **API Endpoints:**
- `GET /api/analytics/dashboard` - Fetch dashboard data
- `POST /api/analytics/dashboard` - Trigger metrics update
- `POST /api/analytics/verify-pin` - PIN verification for access
- `POST /api/analytics/events` - Track custom events
- `POST /api/analytics/page-views` - Track page visits
- `POST /api/analytics/search` - Track search queries

## 📈 Key MVP Insights You'll Get

### **1. User Behavior**
- Which pages get the most traffic?
- How long do users spend browsing?
- What's the drop-off rate from browse → listing → contact?

### **2. Listing Performance**  
- Which brands/conditions perform best?
- What price ranges get most engagement?
- Which listings need better photos/descriptions?

### **3. Search Insights**
- What shoes are users searching for most?
- Are users finding what they want?
- What inventory gaps exist?

### **4. Conversion Analysis**
- Browse → Listing Detail conversion rate
- Listing Detail → Contact conversion rate  
- Overall funnel performance

### **5. Market Validation**
- Geographic distribution of users
- Language preferences (Dutch vs English)
- Peak usage times and patterns

## 🎯 Using Analytics for MVP Decisions

### **Prioritize Features Based On:**
- **High buy now clicks** = Users want direct purchase flow
- **High search volume** = Popular demand areas
- **Low conversion rates** = UX improvement opportunities
- **Popular listings** = Successful seller patterns to promote

### **Content Strategy:**
- **Popular search terms** → Create targeted content
- **High-performing listings** → Identify what works
- **Geographic data** → Localization opportunities

### **Business Validation:**
- **Conversion rates** → Product-market fit indicators
- **User retention** → Repeat visitor patterns  
- **Feature adoption** → Strava verification usage

## 🔄 Daily Operations

### **Automatic Updates:**
- Metrics refresh automatically every dashboard visit
- Daily aggregation runs via API calls
- Real-time event tracking with no manual work needed

### **Manual Refresh:**
Click "Refresh Data" button on dashboard for immediate updates

### **Data Retention:**
- Events: Stored indefinitely for analysis
- Daily metrics: Aggregated for fast queries
- Privacy: Only emails collected (for auth), no PII tracking

## ⚙️ Environment Setup

Add to your `.env.local` file:

```bash
# Analytics PIN (change this for security!)
ANALYTICS_PIN=your_secure_pin_here

# Required for analytics database access
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Security Note:** Change the default PIN (`1234`) to something secure before deploying to production!

## 🚀 Next Steps

1. **Set your PIN** in environment variables
2. **Visit `/analytics`** and login with your PIN
3. **Monitor daily** for early MVP insights
4. **Use data** to validate/pivot MVP features
5. **Scale based on** conversion and engagement patterns

## 📞 Support

If you need any modifications to the analytics tracking or dashboard, the system is fully customizable through:

- `src/lib/analytics.ts` - Core tracking functions
- `src/app/analytics/page.tsx` - Dashboard interface  
- `src/app/api/analytics/verify-pin/route.ts` - PIN verification
- `database/analytics_schema_migration.sql` - Database schema

**Pro Tip:** Watch for patterns in the first 2 weeks of launch to validate your MVP assumptions! 🎯 