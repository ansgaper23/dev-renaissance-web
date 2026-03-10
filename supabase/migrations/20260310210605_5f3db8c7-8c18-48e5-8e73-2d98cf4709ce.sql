
-- Table to store ads per domain
CREATE TABLE public.domain_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  domain text NOT NULL,
  ad_name text NOT NULL DEFAULT '',
  ad_code text NOT NULL DEFAULT '',
  scope text NOT NULL DEFAULT 'playback' CHECK (scope IN ('global', 'playback')),
  is_active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.domain_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Domain ads readable by everyone"
  ON public.domain_ads FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage domain ads"
  ON public.domain_ads FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
