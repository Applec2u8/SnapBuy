-- Create user_manuals table
CREATE TABLE user_manuals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE user_manuals ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access on user_manuals" ON user_manuals
    FOR SELECT USING (true);

-- Allow authenticated users to manage manuals (In a real scenario, this should be restricted to admins, but for now we'll rely on app-level logic or authenticated users if admins are just specific authenticated users)
CREATE POLICY "Allow authenticated users to manage user_manuals" ON user_manuals
    FOR ALL
    USING (auth.role() = 'authenticated');

-- Create an updated_at trigger
CREATE OR REPLACE FUNCTION update_user_manuals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_manuals_updated_at
    BEFORE UPDATE ON user_manuals
    FOR EACH ROW
    EXECUTE FUNCTION update_user_manuals_updated_at();
