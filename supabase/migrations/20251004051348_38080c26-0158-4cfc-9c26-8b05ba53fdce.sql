-- Create debate sessions table
CREATE TABLE public.debate_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  duration_seconds INTEGER,
  transcript JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.debate_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own debate sessions"
ON public.debate_sessions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debate sessions"
ON public.debate_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debate sessions"
ON public.debate_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create debate analytics table
CREATE TABLE public.debate_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.debate_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clarity_score INTEGER CHECK (clarity_score >= 0 AND clarity_score <= 100),
  argument_strength INTEGER CHECK (argument_strength >= 0 AND argument_strength <= 100),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  filler_words_count INTEGER DEFAULT 0,
  speaking_pace TEXT,
  feedback_summary TEXT,
  suggestions JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debate_analytics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own debate analytics"
ON public.debate_analytics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debate analytics"
ON public.debate_analytics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for better query performance
CREATE INDEX idx_debate_sessions_user_id ON public.debate_sessions(user_id);
CREATE INDEX idx_debate_analytics_user_id ON public.debate_analytics(user_id);
CREATE INDEX idx_debate_analytics_session_id ON public.debate_analytics(session_id);