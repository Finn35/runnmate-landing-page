-- Analytics Schema Migration for RUNNMATE MVP
-- This schema tracks user behavior, listing performance, and key metrics

-- Analytics events table - tracks all user interactions
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    listing_id UUID REFERENCES listings(id),
    metadata JSONB DEFAULT '{}',
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Page views table - tracks page visits
CREATE TABLE IF NOT EXISTS analytics_page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_path TEXT NOT NULL,
    page_title TEXT,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    listing_id UUID REFERENCES listings(id),
    time_spent_seconds INTEGER,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Search queries table - tracks what users search for
CREATE TABLE IF NOT EXISTS analytics_search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query TEXT NOT NULL,
    results_count INTEGER DEFAULT 0,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT,
    filters JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User sessions table - tracks user sessions
CREATE TABLE IF NOT EXISTS analytics_user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    pages_visited INTEGER DEFAULT 0,
    events_count INTEGER DEFAULT 0,
    language_preference TEXT,
    is_mobile BOOLEAN DEFAULT false,
    country TEXT,
    city TEXT
);

-- Daily aggregated metrics table - for fast dashboard queries
CREATE TABLE IF NOT EXISTS analytics_daily_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_listings INTEGER DEFAULT 0,
    new_listings INTEGER DEFAULT 0,
    buy_now_clicks INTEGER DEFAULT 0,
    contact_seller_clicks INTEGER DEFAULT 0,
    newsletter_signups INTEGER DEFAULT 0,
    strava_connections INTEGER DEFAULT 0,
    search_queries INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Listing performance metrics
CREATE TABLE IF NOT EXISTS analytics_listing_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id) NOT NULL,
    date DATE NOT NULL,
    views INTEGER DEFAULT 0,
    buy_now_clicks INTEGER DEFAULT 0,
    contact_seller_clicks INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    average_time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(listing_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_listing_id ON analytics_events(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_page_views_created_at ON analytics_page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_page_path ON analytics_page_views(page_path);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_listing_id ON analytics_page_views(listing_id);

CREATE INDEX IF NOT EXISTS idx_analytics_search_queries_created_at ON analytics_search_queries(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_search_queries_query ON analytics_search_queries(query);

CREATE INDEX IF NOT EXISTS idx_analytics_user_sessions_started_at ON analytics_user_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_analytics_user_sessions_user_id ON analytics_user_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_metrics_date ON analytics_daily_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_listing_metrics_date ON analytics_listing_metrics(date);
CREATE INDEX IF NOT EXISTS idx_analytics_listing_metrics_listing_id ON analytics_listing_metrics(listing_id);

-- RLS Policies (restrict access to analytics data)
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_listing_metrics ENABLE ROW LEVEL SECURITY;

-- Only allow service role to access analytics (for admin dashboard)
-- You'll need to create policies based on your admin access requirements

-- Functions for analytics aggregation
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void AS $$
BEGIN
    INSERT INTO analytics_daily_metrics (date, page_views, unique_visitors, new_users, total_listings, new_listings, buy_now_clicks, contact_seller_clicks, newsletter_signups, strava_connections, search_queries)
    SELECT 
        CURRENT_DATE,
        (SELECT COUNT(*) FROM analytics_page_views WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(DISTINCT COALESCE(user_id, session_id)) FROM analytics_page_views WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM auth.users WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM listings WHERE status = 'active'),
        (SELECT COUNT(*) FROM listings WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'buy_now_clicked' AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'contact_seller_clicked' AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'newsletter_signup' AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'strava_connected' AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_search_queries WHERE DATE(created_at) = CURRENT_DATE)
    ON CONFLICT (date) DO UPDATE SET
        page_views = EXCLUDED.page_views,
        unique_visitors = EXCLUDED.unique_visitors,
        new_users = EXCLUDED.new_users,
        total_listings = EXCLUDED.total_listings,
        new_listings = EXCLUDED.new_listings,
        buy_now_clicks = EXCLUDED.buy_now_clicks,
        contact_seller_clicks = EXCLUDED.contact_seller_clicks,
        newsletter_signups = EXCLUDED.newsletter_signups,
        strava_connections = EXCLUDED.strava_connections,
        search_queries = EXCLUDED.search_queries,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to update listing metrics
CREATE OR REPLACE FUNCTION update_listing_metrics()
RETURNS void AS $$
BEGIN
    INSERT INTO analytics_listing_metrics (listing_id, date, views, buy_now_clicks, contact_seller_clicks, unique_viewers, average_time_spent_seconds)
    SELECT 
        pv.listing_id,
        CURRENT_DATE,
        COUNT(*) as views,
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'buy_now_clicked' AND listing_id = pv.listing_id AND DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM analytics_events WHERE event_name = 'contact_seller_clicked' AND listing_id = pv.listing_id AND DATE(created_at) = CURRENT_DATE),
        COUNT(DISTINCT COALESCE(pv.user_id, pv.session_id)) as unique_viewers,
        AVG(pv.time_spent_seconds)::INTEGER as average_time_spent_seconds
    FROM analytics_page_views pv
    WHERE pv.listing_id IS NOT NULL 
    AND DATE(pv.created_at) = CURRENT_DATE
    GROUP BY pv.listing_id
    ON CONFLICT (listing_id, date) DO UPDATE SET
        views = EXCLUDED.views,
        buy_now_clicks = EXCLUDED.buy_now_clicks,
        contact_seller_clicks = EXCLUDED.contact_seller_clicks,
        unique_viewers = EXCLUDED.unique_viewers,
        average_time_spent_seconds = EXCLUDED.average_time_spent_seconds;
END;
$$ LANGUAGE plpgsql;

-- Views for common analytics queries
CREATE OR REPLACE VIEW analytics_overview AS
SELECT 
    dm.date,
    dm.page_views,
    dm.unique_visitors,
    dm.new_users,
    dm.total_listings,
    dm.new_listings,
    dm.buy_now_clicks,
    dm.contact_seller_clicks,
    dm.newsletter_signups,
    dm.strava_connections,
    dm.search_queries,
    CASE 
        WHEN dm.page_views > 0 THEN (dm.buy_now_clicks + dm.contact_seller_clicks)::DECIMAL / dm.page_views * 100 
        ELSE 0 
    END as conversion_rate
FROM analytics_daily_metrics dm
ORDER BY dm.date DESC;

CREATE OR REPLACE VIEW top_performing_listings AS
SELECT 
    l.id,
    l.title,
    l.brand,
    l.price,
    l.condition,
    SUM(lm.views) as total_views,
    SUM(lm.buy_now_clicks) as total_buy_now_clicks,
    SUM(lm.contact_seller_clicks) as total_contact_clicks,
    SUM(lm.unique_viewers) as total_unique_viewers,
    AVG(lm.average_time_spent_seconds) as avg_time_spent
FROM listings l
LEFT JOIN analytics_listing_metrics lm ON l.id = lm.listing_id
WHERE l.status = 'active'
GROUP BY l.id, l.title, l.brand, l.price, l.condition
ORDER BY total_views DESC, total_contact_clicks DESC;

CREATE OR REPLACE VIEW popular_search_terms AS
SELECT 
    query,
    COUNT(*) as search_count,
    AVG(results_count) as avg_results_count,
    DATE(created_at) as search_date
FROM analytics_search_queries
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY query, DATE(created_at)
ORDER BY search_count DESC;

COMMENT ON TABLE analytics_events IS 'Tracks all user interactions and events';
COMMENT ON TABLE analytics_page_views IS 'Tracks page visits and time spent';
COMMENT ON TABLE analytics_search_queries IS 'Tracks search queries and results';
COMMENT ON TABLE analytics_user_sessions IS 'Tracks user sessions and behavior';
COMMENT ON TABLE analytics_daily_metrics IS 'Aggregated daily metrics for fast queries';
COMMENT ON TABLE analytics_listing_metrics IS 'Performance metrics per listing'; 