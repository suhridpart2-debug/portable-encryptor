-- SQL Schema for Portable Encryptor

-- Create a table for storing file metadata
CREATE TABLE IF NOT EXISTS public.files_metadata (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    filename TEXT NOT NULL,
    original_size BIGINT NOT NULL,
    encrypted_size BIGINT NOT NULL,
    status TEXT DEFAULT 'encrypted' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    
    -- Optional: Add extra metadata if needed
    file_type TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.files_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
-- Users can only see their own file metadata
CREATE POLICY "Users can view their own file metadata" 
ON public.files_metadata 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert their own file metadata
CREATE POLICY "Users can insert their own file metadata" 
ON public.files_metadata 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own file metadata
CREATE POLICY "Users can delete their own file metadata" 
ON public.files_metadata 
FOR DELETE 
USING (auth.uid() = user_id);
