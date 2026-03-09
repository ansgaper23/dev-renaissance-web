-- Add RLS policies for site-assets bucket to allow uploads
CREATE POLICY "Allow public uploads to site-assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'site-assets');

CREATE POLICY "Allow public read from site-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Allow public update in site-assets"
ON storage.objects FOR UPDATE
USING (bucket_id = 'site-assets');

CREATE POLICY "Allow public delete from site-assets"
ON storage.objects FOR DELETE
USING (bucket_id = 'site-assets');