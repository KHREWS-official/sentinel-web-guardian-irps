
-- Add table for updates/announcements
CREATE TABLE public.updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by_admin BOOLEAN DEFAULT TRUE
);

-- Add table for daily statistics tracking
CREATE TABLE public.daily_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  accounts_suspended INTEGER DEFAULT 0,
  links_submitted INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(date)
);

-- Add language detection and content type columns to existing tables
ALTER TABLE public.blocked_sites 
ADD COLUMN detected_language TEXT DEFAULT 'english',
ADD COLUMN content_category TEXT DEFAULT 'general';

ALTER TABLE public.waiting_list 
ADD COLUMN detected_language TEXT DEFAULT 'english',
ADD COLUMN content_category TEXT DEFAULT 'general';

-- Enable RLS for new tables
ALTER TABLE public.updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access for updates" ON public.updates FOR SELECT USING (true);
CREATE POLICY "Public insert access for updates" ON public.updates FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for updates" ON public.updates FOR UPDATE USING (true);
CREATE POLICY "Public delete access for updates" ON public.updates FOR DELETE USING (true);

CREATE POLICY "Public read access for daily_stats" ON public.daily_stats FOR SELECT USING (true);
CREATE POLICY "Public insert access for daily_stats" ON public.daily_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access for daily_stats" ON public.daily_stats FOR UPDATE USING (true);

-- Create indexes for better performance
CREATE INDEX idx_updates_created_at ON public.updates(created_at DESC);
CREATE INDEX idx_daily_stats_date ON public.daily_stats(date DESC);

-- Insert some sample data for daily stats
INSERT INTO public.daily_stats (date, accounts_suspended, links_submitted) 
VALUES 
  (CURRENT_DATE, 24, 156),
  (CURRENT_DATE - INTERVAL '1 day', 18, 142),
  (CURRENT_DATE - INTERVAL '2 days', 31, 189),
  (CURRENT_DATE - INTERVAL '3 days', 22, 167),
  (CURRENT_DATE - INTERVAL '4 days', 29, 203),
  (CURRENT_DATE - INTERVAL '5 days', 16, 134),
  (CURRENT_DATE - INTERVAL '6 days', 33, 224);

-- Insert sample updates
INSERT INTO public.updates (title, content) 
VALUES 
  ('🚨 Enhanced Multi-Language Detection Active', 'Our system now actively monitors content in English, Arabic, Urdu, and Hindi with special focus on anti-Islamic and blasphemous content detection across all social media platforms.'),
  ('🔍 Advanced Web Scraping Deployed', 'Implemented advanced Deno-powered web scraping with enhanced detection for adult content including images and text analysis with 99.7% accuracy rate.'),
  ('⚡ Real-Time Monitoring Updates', 'System now processes over 10,000 URLs daily with immediate blocking of harmful content. Account suspension rate increased by 45% this week.');
