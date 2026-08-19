DROP POLICY IF EXISTS "Authenticated users can upload to board images" ON storage.objects;

CREATE POLICY "Users can upload their own board images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'board-images'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can update their own board images" ON storage.objects;
CREATE POLICY "Users can update their own board images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'board-images' AND owner = auth.uid())
WITH CHECK (
  bucket_id = 'board-images'
  AND owner = auth.uid()
  AND (storage.foldername(name))[1] = auth.uid()::text
);