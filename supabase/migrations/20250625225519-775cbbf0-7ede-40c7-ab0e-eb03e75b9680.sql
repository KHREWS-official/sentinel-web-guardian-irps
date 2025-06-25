
-- Create table for blocked websites and social media profiles
CREATE TABLE public.blocked_sites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  detected_content TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(5,2) NOT NULL,
  site_type TEXT NOT NULL CHECK (site_type IN ('website', 'social_media')),
  blocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  analysis_details JSONB DEFAULT '{}'
);

-- Create table for waiting list (manual review required)
CREATE TABLE public.waiting_list (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  detected_content TEXT[] DEFAULT '{}',
  confidence_score DECIMAL(5,2) NOT NULL,
  site_type TEXT NOT NULL CHECK (site_type IN ('website', 'social_media')),
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed BOOLEAN DEFAULT FALSE,
  analysis_details JSONB DEFAULT '{}'
);

-- Create table for high alert profiles (admin managed)
CREATE TABLE public.high_alert_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  site_type TEXT NOT NULL CHECK (site_type IN ('website', 'social_media')),
  added_by_admin BOOLEAN DEFAULT TRUE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT
);

-- Create table for analysis logs
CREATE TABLE public.analysis_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  analysis_result TEXT NOT NULL CHECK (analysis_result IN ('blocked', 'waiting', 'safe')),
  confidence_score DECIMAL(5,2) NOT NULL,
  detected_keywords TEXT[] DEFAULT '{}',
  analysis_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processing_time_ms INTEGER,
  ai_model_version TEXT DEFAULT 'v1.0'
);

-- Enable Row Level Security (make tables public for this monitoring system)
ALTER TABLE public.blocked_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waiting_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.high_alert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (monitoring system)
CREATE POLICY "Public read access for blocked_sites" ON public.blocked_sites FOR SELECT USING (true);
CREATE POLICY "Public insert access for blocked_sites" ON public.blocked_sites FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read access for waiting_list" ON public.waiting_list FOR SELECT USING (true);
CREATE POLICY "Public insert access for waiting_list" ON public.waiting_list FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for waiting_list" ON public.waiting_list FOR UPDATE USING (true);

CREATE POLICY "Public read access for high_alert_profiles" ON public.high_alert_profiles FOR SELECT USING (true);
CREATE POLICY "Public insert access for high_alert_profiles" ON public.high_alert_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public access for analysis_logs" ON public.analysis_logs FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX idx_blocked_sites_url ON public.blocked_sites(url);
CREATE INDEX idx_blocked_sites_blocked_at ON public.blocked_sites(blocked_at DESC);
CREATE INDEX idx_waiting_list_url ON public.waiting_list(url);
CREATE INDEX idx_waiting_list_reviewed ON public.waiting_list(reviewed);
CREATE INDEX idx_high_alert_profiles_url ON public.high_alert_profiles(url);
CREATE INDEX idx_analysis_logs_timestamp ON public.analysis_logs(analysis_timestamp DESC);
