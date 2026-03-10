
-- Fix featured_items RLS: drop restrictive policies and create permissive ones
DROP POLICY IF EXISTS "Admins can delete featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Admins can insert featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Admins can update featured items" ON public.featured_items;
DROP POLICY IF EXISTS "Featured items are viewable by everyone" ON public.featured_items;

CREATE POLICY "Featured items are viewable by everyone"
  ON public.featured_items FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert featured items"
  ON public.featured_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update featured items"
  ON public.featured_items FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete featured items"
  ON public.featured_items FOR DELETE
  USING (true);

-- Also fix domain_ads to be permissive (they were created as restrictive by default)
DROP POLICY IF EXISTS "Domain ads readable by everyone" ON public.domain_ads;
DROP POLICY IF EXISTS "Admins can manage domain ads" ON public.domain_ads;

CREATE POLICY "Domain ads readable by everyone"
  ON public.domain_ads FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert domain ads"
  ON public.domain_ads FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can update domain ads"
  ON public.domain_ads FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete domain ads"
  ON public.domain_ads FOR DELETE
  USING (true);
