-- StudioCMS's 16 core tables + its 3 migration-bookkeeping tables, as real
-- SQLite DDL. Extracted by running StudioCMS's own Kysely migrator against
-- a local D1 simulation (scripts/d1/01-create-studiocms-schema.mjs without
-- `remote: true`) and dumping the resulting schema — this is exactly what
-- that migrator would create remotely, just captured as plain SQL since
-- wrangler CLI auth isn't available here. Paste this whole block into the
-- D1 dashboard's Console tab, same as scripts/d1/schema.sql.
--
-- Parent tables first (FK references aren't enforced by SQLite/D1 unless
-- PRAGMA foreign_keys=ON is set, so this order isn't strictly required, but
-- it's the same convention scripts/d1/02-migrate-data.mjs's TABLES list
-- uses, kept consistent here).

CREATE TABLE "StudioCMSUsersTable" ("id" text primary key, "url" text, "name" text not null, "email" text, "avatar" text, "username" text not null, "password" text, "updatedAt" text not null, "createdAt" text default CURRENT_TIMESTAMP not null, "emailVerified" integer default 0 not null, "notifications" text);

CREATE TABLE "StudioCMSPageFolderStructure" ("id" text primary key, "name" text not null, "parent" text);

CREATE TABLE "StudioCMSPageData" ("id" text primary key, "package" text not null, "title" text not null, "description" text not null, "showOnNav" integer default 0 not null, "publishedAt" text, "updatedAt" text not null, "slug" text not null, "contentLang" text not null, "heroImage" text, "categories" text default '[]' not null, "tags" text default '[]' not null, "authorId" text not null, "contributorIds" text default '[]' not null, "showAuthor" integer default 0 not null, "showContributors" integer default 0 not null, "parentFolder" text, "draft" integer default 0 not null, "augments" text default '[]' not null);

CREATE TABLE "StudioCMSOAuthAccounts" ("providerUserId" text not null, "provider" text not null, "userId" text not null references "StudioCMSUsersTable" ("id"));

CREATE TABLE "StudioCMSSessionTable" ("id" text primary key, "userId" text not null references "StudioCMSUsersTable" ("id"), "expiresAt" text not null);

CREATE TABLE "StudioCMSPermissions" ("user" text not null references "StudioCMSUsersTable" ("id"), "rank" text not null);

CREATE TABLE "StudioCMSAPIKeys" ("id" text primary key, "userId" text not null references "StudioCMSUsersTable" ("id"), "key" text not null, "creationDate" text not null, "description" text);

CREATE TABLE "StudioCMSUserResetTokens" ("id" text primary key, "userId" text not null references "StudioCMSUsersTable" ("id"), "token" text not null);

CREATE TABLE "StudioCMSEmailVerificationTokens" ("id" text primary key, "userId" text not null references "StudioCMSUsersTable" ("id"), "token" text not null, "expiresAt" text not null);

CREATE TABLE "StudioCMSDiffTracking" ("id" text primary key, "pageId" text not null references "StudioCMSPageData" ("id"), "userId" text not null references "StudioCMSUsersTable" ("id"), "timestamp" text not null, "pageMetaData" text not null, "pageContentStart" text not null, "diff" text);

CREATE TABLE "StudioCMSPageContent" ("id" text primary key, "contentId" text not null references "StudioCMSPageData" ("id"), "contentLang" text not null, "content" text not null);

CREATE TABLE "StudioCMSPageDataTags" ("id" integer primary key, "description" text not null, "name" text not null, "slug" text not null, "meta" text not null);

CREATE TABLE "StudioCMSPageDataCategories" ("id" integer primary key, "parent" integer, "description" text not null, "name" text not null, "slug" text not null, "meta" text not null);

CREATE TABLE "StudioCMSPluginData" ("id" text primary key, "data" text not null);

CREATE TABLE "StudioCMSDynamicConfigSettings" ("id" text primary key, "data" text not null);

CREATE TABLE "StudioCMSStorageManagerUrlMappings" ("identifier" text primary key, "url" text not null, "isPermanent" integer default 0 not null, "expiresAt" integer, "createdAt" integer not null, "updatedAt" integer not null);

CREATE TABLE "_kysely_schema_v1" ("id" integer primary key, "definition" text not null);

CREATE TABLE "kysely_migration" ("name" varchar(255) not null primary key, "timestamp" varchar(255) not null);

CREATE TABLE "kysely_migration_lock" ("id" varchar(255) not null primary key, "is_locked" integer default 0 not null);

-- StudioCMS's migrator checks these two bookkeeping tables to know which
-- migrations have already run. Since we're creating the end-result schema
-- directly instead of letting the migrator apply its migrations one by
-- one, mark all 3 as already-applied (timestamps copied verbatim from the
-- real migration run) so the live app (once cut over to 'd1') doesn't try
-- to re-run them against a schema that already has their changes baked in.
--
-- Deliberately NOT inserting anything into _kysely_schema_v1 — its only
-- captured snapshot (from the local run used to produce this file) is
-- stale: it lists StudioCMSSiteConfig/StudioCMSMailerConfig/
-- StudioCMSNotificationSettings, which the drop_deprecated migration
-- removed. That table is left empty; it's an audit/diff aid the migrator
-- repopulates on its own, not something the live app reads to function —
-- real table structure comes from PRAGMA-based introspection instead.
INSERT INTO "kysely_migration_lock" ("id", "is_locked") VALUES ('migration_lock', 0);
INSERT INTO "kysely_migration" ("name", "timestamp") VALUES
  ('20251025T040912_init', '2026-10-05T08:32:28.106Z'),
  ('20251130T150847_drop_deprecated', '2026-10-05T08:32:28.404Z'),
  ('20251221T002125_url-mapping', '2026-10-05T08:32:28.671Z');
