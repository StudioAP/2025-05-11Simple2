
DROP POLICY IF EXISTS "誰でも公開されている写真を読むことができる" ON storage.objects;
DROP POLICY IF EXISTS "所有者のみ写真をアップロードできる" ON storage.objects;
DROP POLICY IF EXISTS "所有者のみ写真を削除できる" ON storage.objects;

CREATE POLICY "誰でも公開バケットの写真を読むことができる"
ON storage.objects FOR SELECT
USING (
  bucket_id IN ('school_photos', 'announcement_photos')
);

CREATE POLICY "所有者のみ写真をアップロードできる"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id IN ('school_photos', 'announcement_photos') AND
  (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    ) OR
    auth.is_service_role() OR
    auth.is_admin()
  )
);

CREATE POLICY "所有者のみ写真を削除できる"
ON storage.objects FOR DELETE
USING (
  bucket_id IN ('school_photos', 'announcement_photos') AND
  (
    EXISTS (
      SELECT 1 FROM schools 
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    ) OR
    auth.is_service_role() OR
    auth.is_admin()
  )
);

CREATE OR REPLACE FUNCTION storage.file_exists(
  bucket text,
  path text
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = file_exists.bucket
    AND name = file_exists.path
  );
EXCEPTION
  WHEN OTHERS THEN RETURN false;
END;
$$;
