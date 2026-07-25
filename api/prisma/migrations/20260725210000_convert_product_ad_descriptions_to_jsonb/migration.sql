ALTER TABLE "Product"
ALTER COLUMN "description" TYPE JSONB
USING jsonb_build_object(
  'blocks',
  CASE
    WHEN btrim("description") = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(
      jsonb_build_object('type', 'paragraph', 'text', "description")
    )
  END
);

ALTER TABLE "Ad"
ALTER COLUMN "description" TYPE JSONB
USING jsonb_build_object(
  'blocks',
  CASE
    WHEN btrim("description") = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(
      jsonb_build_object('type', 'paragraph', 'text', "description")
    )
  END
);
