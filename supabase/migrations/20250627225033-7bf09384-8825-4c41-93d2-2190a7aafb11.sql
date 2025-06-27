
-- Create table for contact messages
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_status BOOLEAN DEFAULT FALSE
);

-- Add image_url column to existing updates table (if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'updates' AND column_name = 'image_url') THEN
        ALTER TABLE public.updates ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add published column to existing updates table (if it doesn't exist)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'updates' AND column_name = 'published') THEN
        ALTER TABLE public.updates ADD COLUMN published BOOLEAN DEFAULT TRUE;
    END IF;
END $$;

-- Create table for learning AI coding content
CREATE TABLE public.learning_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Learning AI Coding',
  description TEXT NOT NULL DEFAULT 'Master AI-powered development with cutting-edge techniques',
  content TEXT NOT NULL DEFAULT 'Explore the world of AI coding with our comprehensive resources and tutorials.',
  image_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security for new tables
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

-- Create policies for contact messages
CREATE POLICY "Public insert access for contact_messages" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin access for contact_messages" ON public.contact_messages FOR ALL USING (true);

-- Create policies for learning content
CREATE POLICY "Public read access for learning_content" ON public.learning_content FOR SELECT USING (true);
CREATE POLICY "Admin access for learning_content" ON public.learning_content FOR ALL USING (true);

-- Update existing updates policies (if needed)
DO $$
BEGIN
    -- Check if the policy exists, if not create it
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'updates' AND policyname = 'Public read access for published updates') THEN
        CREATE POLICY "Public read access for published updates" ON public.updates FOR SELECT USING (published = true);
    END IF;
END $$;

-- Insert default learning content
INSERT INTO public.learning_content (title, description, content) VALUES 
('Learning AI Coding', 'Master AI-powered development with cutting-edge techniques', 'Explore the world of AI coding with our comprehensive resources and tutorials.');

-- Create indexes for better performance
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
CREATE INDEX idx_updates_published ON public.updates(published);
