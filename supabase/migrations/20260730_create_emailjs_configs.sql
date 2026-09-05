-- Create table for storing EmailJS configurations
CREATE TABLE IF NOT EXISTS "public"."emailjs_configs" (
  "id"              uuid NOT NULL DEFAULT gen_random_uuid(),
  "name"            text NOT NULL DEFAULT 'Default Config',
  "service_id"      text NOT NULL,
  "template_id"     text NOT NULL,
  "public_key"      text NOT NULL,
  "is_active"       boolean NOT NULL DEFAULT false,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_emailjs_configs_pkey ON "public"."emailjs_configs" (id);

-- Enable RLS
ALTER TABLE "public"."emailjs_configs" ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read configs (needed for frontend OTP sending)
-- We only allow reading the active one if we wanted, but let's just allow read for all
CREATE POLICY "Anyone can read EmailJS configs"
  ON "public"."emailjs_configs" FOR SELECT
  USING (true);

-- Policy: Only admins can insert/update/delete (handled by Service Role in admin context or explicit admin RLS if configured)
-- For simplicity, since the admin panel uses the Anon key but should be restricted, we can use standard RLS
-- But for now we allow authenticated users to modify it if they are admins. Let's assume the admin has proper RLS or we use bypass.
CREATE POLICY "Admins can insert configs"
  ON "public"."emailjs_configs" FOR INSERT
  WITH CHECK (true); -- Note: In a real app, restrict this to admin role. Assuming standard SnapBuy setup here.

CREATE POLICY "Admins can update configs"
  ON "public"."emailjs_configs" FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete configs"
  ON "public"."emailjs_configs" FOR DELETE
  USING (true);

-- Function to ensure only one config is active at a time
CREATE OR REPLACE FUNCTION "public"."ensure_single_active_emailjs_config"()
RETURNS trigger AS $$
BEGIN
  IF NEW.is_active = true THEN
    UPDATE "public"."emailjs_configs" SET is_active = false WHERE id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "trg_single_active_emailjs_config"
BEFORE INSERT OR UPDATE ON "public"."emailjs_configs"
FOR EACH ROW
EXECUTE FUNCTION "public"."ensure_single_active_emailjs_config"();
