\set ON_ERROR_STOP on

-- Run with psql only after an authorized operator confirms the production
-- Neon project, database, and schema and supplies a dedicated read-only role.
-- This script contains no connection settings and performs no DDL or DML.

BEGIN;
SET TRANSACTION READ ONLY;

SELECT current_setting('transaction_read_only') = 'on' AS readonly_confirmed
\gset
\if :readonly_confirmed
\echo 'Read-only transaction confirmed.'
\else
\echo 'Read-only transaction could not be established; inspection stopped.'
\quit 3
\endif

\echo '--- Verified session target (confirm these values against the authorized Neon console) ---'
SELECT
  current_database() AS database_name,
  current_schema() AS inspection_schema,
  current_user AS database_role,
  current_setting('transaction_read_only') AS transaction_read_only;

\echo '--- Required enum types and labels ---'
WITH expected(type_name, expected_labels) AS (
  VALUES
    ('CompanyRole', ARRAY['BUYER', 'SUPPLIER', 'BOTH']::text[]),
    ('CompanyStatus', ARRAY['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED']::text[]),
    ('ProductVisibility', ARRAY['PUBLIC', 'APPROVED_BUYERS', 'SELECTED_COMPANIES']::text[])
),
actual AS (
  SELECT
    type_namespace.nspname AS schema_name,
    type_catalog.typname AS type_name,
    array_agg(enum_catalog.enumlabel::text ORDER BY enum_catalog.enumsortorder) AS labels
  FROM pg_type AS type_catalog
  JOIN pg_namespace AS type_namespace ON type_namespace.oid = type_catalog.typnamespace
  JOIN pg_enum AS enum_catalog ON enum_catalog.enumtypid = type_catalog.oid
  WHERE type_namespace.nspname = current_schema()
  GROUP BY type_namespace.nspname, type_catalog.typname
)
SELECT
  current_schema() AS schema_name,
  expected.type_name,
  expected.expected_labels,
  actual.labels AS actual_labels,
  COALESCE(actual.labels = expected.expected_labels, false) AS matches
FROM expected
LEFT JOIN actual USING (type_name)
ORDER BY expected.type_name;

\echo '--- Required tables ---'
WITH expected(table_name) AS (
  VALUES ('Company'), ('CompanyProductAccess'), ('RegistrationRateLimit')
)
SELECT
  current_schema() AS schema_name,
  expected.table_name,
  to_regclass(format('%I.%I', current_schema(), expected.table_name)) IS NOT NULL AS present
FROM expected
ORDER BY expected.table_name;

\echo '--- Required columns on Company, CompanyProductAccess, RegistrationRateLimit ---'
WITH expected(table_name, column_name, expected_type, expected_nullable, expected_default_contains) AS (
  VALUES
    ('Company', 'id', 'text', false, NULL::text),
    ('Company', 'companyName', 'text', false, NULL::text),
    ('Company', 'contactName', 'text', false, NULL::text),
    ('Company', 'email', 'text', false, NULL::text),
    ('Company', 'phone', 'text', false, NULL::text),
    ('Company', 'passwordHash', 'text', false, NULL::text),
    ('Company', 'requestedRole', 'CompanyRole', false, NULL::text),
    ('Company', 'role', 'CompanyRole', true, NULL::text),
    ('Company', 'status', 'CompanyStatus', false, 'PENDING'),
    ('Company', 'city', 'text', false, NULL::text),
    ('Company', 'state', 'text', false, NULL::text),
    ('Company', 'gstin', 'text', true, NULL::text),
    ('Company', 'createdAt', 'timestamp', false, 'CURRENT_TIMESTAMP'),
    ('Company', 'updatedAt', 'timestamp', false, NULL::text),
    ('CompanyProductAccess', 'companyId', 'text', false, NULL::text),
    ('CompanyProductAccess', 'productId', 'text', false, NULL::text),
    ('CompanyProductAccess', 'createdAt', 'timestamp', false, 'CURRENT_TIMESTAMP'),
    ('RegistrationRateLimit', 'ipHash', 'text', false, NULL::text),
    ('RegistrationRateLimit', 'windowStartedAt', 'timestamp', false, NULL::text),
    ('RegistrationRateLimit', 'attempts', 'int4', false, '1')
)
SELECT
  expected.table_name,
  expected.column_name,
  expected.expected_type,
  actual_type.typname AS postgres_type,
  CASE WHEN actual_attribute.attnotnull THEN 'NO' WHEN actual_attribute.attname IS NOT NULL THEN 'YES' END AS is_nullable,
  pg_get_expr(actual_default.adbin, actual_default.adrelid) AS column_default,
  actual_attribute.attname IS NOT NULL AS present,
  COALESCE(
    actual_type.typname = expected.expected_type
    AND actual_type.typnamespace = CASE
      WHEN expected.expected_type IN ('CompanyRole', 'CompanyStatus')
        THEN to_regnamespace(current_schema())
      ELSE 'pg_catalog'::regnamespace
    END
    AND actual_attribute.attnotnull = (NOT expected.expected_nullable)
    AND (
      expected.expected_type <> 'timestamp'
      OR actual_attribute.atttypmod = 3
    )
    AND (
      expected.expected_default_contains IS NULL
      OR pg_get_expr(actual_default.adbin, actual_default.adrelid) ILIKE
        '%' || expected.expected_default_contains || '%'
    ),
    false
  ) AS matches_expected_shape
FROM expected
LEFT JOIN pg_class AS actual_table
  ON actual_table.oid = to_regclass(format('%I.%I', current_schema(), expected.table_name))
LEFT JOIN pg_attribute AS actual_attribute
  ON actual_attribute.attrelid = actual_table.oid
  AND actual_attribute.attname = expected.column_name
  AND actual_attribute.attnum > 0
  AND NOT actual_attribute.attisdropped
LEFT JOIN pg_type AS actual_type
  ON actual_type.oid = actual_attribute.atttypid
LEFT JOIN pg_attrdef AS actual_default
  ON actual_default.adrelid = actual_table.oid
  AND actual_default.adnum = actual_attribute.attnum
ORDER BY expected.table_name, expected.column_name;

\echo '--- Product.visibility definition ---'
SELECT
  current_schema() AS table_schema,
  'Product' AS table_name,
  'visibility' AS column_name,
  visibility_type.typname AS underlying_type,
  CASE WHEN visibility_attribute.attnotnull THEN 'NO' WHEN visibility_attribute.attname IS NOT NULL THEN 'YES' END AS is_nullable,
  pg_get_expr(visibility_default.adbin, visibility_default.adrelid) AS column_default,
  COALESCE(
    visibility_type.typname = 'ProductVisibility'
    AND visibility_type.typnamespace = to_regnamespace(current_schema())
    AND visibility_attribute.attnotnull
    AND pg_get_expr(visibility_default.adbin, visibility_default.adrelid) LIKE '%PUBLIC%',
    false
  ) AS column_present_with_expected_shape
FROM (SELECT to_regclass(format('%I.%I', current_schema(), 'Product')) AS product_relation) AS expected
LEFT JOIN pg_attribute AS visibility_attribute
  ON visibility_attribute.attrelid = expected.product_relation
  AND visibility_attribute.attname = 'visibility'
  AND visibility_attribute.attnum > 0
  AND NOT visibility_attribute.attisdropped
LEFT JOIN pg_type AS visibility_type
  ON visibility_type.oid = visibility_attribute.atttypid
LEFT JOIN pg_attrdef AS visibility_default
  ON visibility_default.adrelid = expected.product_relation
  AND visibility_default.adnum = visibility_attribute.attnum;

\echo '--- Required indexes and primary/unique key indexes from the pending migration ---'
WITH expected(index_name, table_name, expected_columns, expected_kind) AS (
  VALUES
    ('Company_pkey', 'Company', ARRAY['id']::text[], 'PRIMARY KEY'),
    ('Company_email_key', 'Company', ARRAY['email']::text[], 'UNIQUE'),
    ('Company_status_createdAt_idx', 'Company', ARRAY['status', 'createdAt']::text[], 'INDEX'),
    ('CompanyProductAccess_pkey', 'CompanyProductAccess', ARRAY['companyId', 'productId']::text[], 'PRIMARY KEY'),
    ('CompanyProductAccess_productId_idx', 'CompanyProductAccess', ARRAY['productId']::text[], 'INDEX'),
    ('RegistrationRateLimit_pkey', 'RegistrationRateLimit', ARRAY['ipHash']::text[], 'PRIMARY KEY')
)
SELECT
  expected.table_name,
  expected.index_name,
  expected.expected_columns,
  expected.expected_kind,
  actual.indexdef,
  actual.indexname IS NOT NULL AS present,
  COALESCE(
    actual_columns.columns = expected.expected_columns
    AND CASE expected.expected_kind
      WHEN 'PRIMARY KEY' THEN actual_index.indisprimary AND actual_index.indisunique
      WHEN 'UNIQUE' THEN NOT actual_index.indisprimary AND actual_index.indisunique
      ELSE NOT actual_index.indisprimary AND NOT actual_index.indisunique
    END
    AND actual_index.indpred IS NULL
    AND actual_index.indexprs IS NULL
    AND access_method.amname = 'btree'
    AND actual_index.indisready
    AND actual_index.indisvalid
    AND actual_index.indislive,
    false
  ) AS matches_expected_shape
FROM expected
LEFT JOIN pg_indexes AS actual
  ON actual.schemaname = current_schema()
  AND actual.tablename = expected.table_name
  AND actual.indexname = expected.index_name
LEFT JOIN pg_class AS index_relation
  ON index_relation.oid = to_regclass(format('%I.%I', current_schema(), actual.indexname))
LEFT JOIN pg_index AS actual_index
  ON actual_index.indexrelid = index_relation.oid
LEFT JOIN pg_am AS access_method
  ON access_method.oid = index_relation.relam
LEFT JOIN LATERAL (
  SELECT array_agg(attribute.attname::text ORDER BY key_column.ordinality) AS columns
  FROM unnest(actual_index.indkey) WITH ORDINALITY AS key_column(attnum, ordinality)
  JOIN pg_attribute AS attribute
    ON attribute.attrelid = actual_index.indrelid
    AND attribute.attnum = key_column.attnum
  WHERE key_column.ordinality <= actual_index.indnkeyatts
) AS actual_columns ON true
ORDER BY expected.table_name, expected.index_name;

\echo '--- Required foreign keys and cascade behavior ---'
WITH expected(constraint_name, table_name, source_column, target_table, target_column) AS (
  VALUES
    ('CompanyProductAccess_companyId_fkey', 'CompanyProductAccess', 'companyId', 'Company', 'id'),
    ('CompanyProductAccess_productId_fkey', 'CompanyProductAccess', 'productId', 'Product', 'id')
)
SELECT
  expected.table_name,
  expected.constraint_name,
  constraint_catalog.contype AS constraint_type,
  pg_get_constraintdef(constraint_catalog.oid, true) AS actual_definition,
  constraint_catalog.conname IS NOT NULL AS present,
  COALESCE(constraint_catalog.confdeltype = 'c', false) AS on_delete_cascade,
  COALESCE(constraint_catalog.confupdtype = 'c', false) AS on_update_cascade,
  COALESCE(
    source_attribute.attname = expected.source_column
    AND target_namespace.nspname = current_schema()
    AND target_relation.relname = expected.target_table
    AND target_attribute.attname = expected.target_column
    AND cardinality(constraint_catalog.conkey) = 1
    AND cardinality(constraint_catalog.confkey) = 1
    AND constraint_catalog.confdeltype = 'c'
    AND constraint_catalog.confupdtype = 'c'
    AND constraint_catalog.confmatchtype = 's'
    AND NOT constraint_catalog.condeferrable
    AND constraint_catalog.convalidated,
    false
  ) AS matches_expected_shape
FROM expected
LEFT JOIN pg_constraint AS constraint_catalog
  ON constraint_catalog.connamespace = to_regnamespace(current_schema())
  AND constraint_catalog.conrelid =
    to_regclass(format('%I.%I', current_schema(), expected.table_name))
  AND constraint_catalog.conname = expected.constraint_name
LEFT JOIN pg_attribute AS source_attribute
  ON source_attribute.attrelid = constraint_catalog.conrelid
  AND source_attribute.attnum = constraint_catalog.conkey[1]
LEFT JOIN pg_class AS target_relation
  ON target_relation.oid = constraint_catalog.confrelid
LEFT JOIN pg_namespace AS target_namespace
  ON target_namespace.oid = target_relation.relnamespace
LEFT JOIN pg_attribute AS target_attribute
  ON target_attribute.attrelid = constraint_catalog.confrelid
  AND target_attribute.attnum = constraint_catalog.confkey[1]
ORDER BY expected.constraint_name;

\echo '--- Required primary-key constraints ---'
WITH expected(constraint_name, table_name, expected_columns) AS (
  VALUES
    ('Company_pkey', 'Company', ARRAY['id']::text[]),
    ('CompanyProductAccess_pkey', 'CompanyProductAccess', ARRAY['companyId', 'productId']::text[]),
    ('RegistrationRateLimit_pkey', 'RegistrationRateLimit', ARRAY['ipHash']::text[])
)
SELECT
  expected.table_name,
  expected.constraint_name,
  expected.expected_columns,
  actual.contype AS constraint_type,
  pg_get_constraintdef(actual.oid, true) AS actual_definition,
  actual.conname IS NOT NULL AND actual.contype = 'p' AS present_as_primary_key,
  COALESCE(
    actual.contype = 'p'
    AND actual.convalidated
    AND NOT actual.condeferrable
    AND actual_columns.columns = expected.expected_columns,
    false
  ) AS matches_expected_shape
FROM expected
LEFT JOIN pg_constraint AS actual
  ON actual.connamespace = to_regnamespace(current_schema())
  AND actual.conrelid = to_regclass(format('%I.%I', current_schema(), expected.table_name))
  AND actual.conname = expected.constraint_name
LEFT JOIN LATERAL (
  SELECT array_agg(attribute.attname::text ORDER BY key_column.ordinality) AS columns
  FROM unnest(actual.conkey) WITH ORDINALITY AS key_column(attnum, ordinality)
  JOIN pg_attribute AS attribute
    ON attribute.attrelid = actual.conrelid
    AND attribute.attnum = key_column.attnum
) AS actual_columns ON true
ORDER BY expected.table_name;

\echo '--- Pending migration ledger status ---'
SELECT
  to_regclass(format('%I.%I', current_schema(), '_prisma_migrations')) IS NOT NULL
    AS prisma_migrations_table_present
\gset

\if :prisma_migrations_table_present
\echo 'Migration ledger summary for the pending migration:'
SELECT
  count(*) AS matching_ledger_rows,
  count(*) FILTER (WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL) AS finished_rows,
  count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL) AS unfinished_rows,
  count(*) FILTER (WHERE rolled_back_at IS NOT NULL) AS rolled_back_rows
FROM "_prisma_migrations"
WHERE migration_name = '20261021160000_add_company_accounts_and_product_visibility';

\echo 'Migration ledger history (names and status only; logs are intentionally omitted):'
SELECT
  migration_name,
  started_at,
  finished_at,
  rolled_back_at,
  CASE
    WHEN rolled_back_at IS NOT NULL THEN 'rolled back'
    WHEN finished_at IS NOT NULL THEN 'finished'
    ELSE 'unfinished'
  END AS ledger_status
FROM "_prisma_migrations"
ORDER BY started_at, migration_name;

SELECT
  count(*) FILTER (WHERE finished_at IS NULL AND rolled_back_at IS NULL) AS unfinished_migration_count
FROM "_prisma_migrations";
\else
\echo 'No _prisma_migrations table found in current_schema(); verify the schema/search_path and migration history separately.'
\endif

ROLLBACK;
\echo '--- Inspection complete: transaction rolled back; no changes were made ---'
