-- D1 schema for the 7 tables this project's own `site-content` plugin owns
-- (plugins/site-content/*) — NOT managed by StudioCMS's Kysely migrator, so
-- unlike its 16 core tables these need to be created explicitly.
--
-- Source of truth: the `createTableSQL` constant in each content-type file
-- (plugins/site-content/content-types/*.mjs, plugins/site-content/settings/
-- site-config.mjs) and the inline table in plugins/site-content/index.mjs.
-- This file mirrors their CURRENT full column set (i.e. createTableSQL +
-- every backfilled `addedColumns` entry already folded in) — there's no
-- need to replay the incremental ALTER TABLEs those files do against MySQL,
-- since a fresh D1 database starts from zero.
--
-- The only real dialect difference from the MySQL originals: MySQL's
-- `UNIQUE KEY name (col)` table-constraint syntax isn't valid SQLite, so
-- plugin_podcast_episodes' uniqueness is expressed as a separate index
-- instead. Everything else (varchar(191), text, longtext, int, backtick
-- identifiers) is accepted as-is under SQLite's type-affinity rules.
--
-- Apply with:
--   wrangler d1 execute dylan-gemelli-db --remote --file=scripts/d1/schema.sql
-- (drop --remote to apply to the local Miniflare D1 simulator instead)

CREATE TABLE IF NOT EXISTS contact_submissions (
  id varchar(191) NOT NULL PRIMARY KEY,
  fullName text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  submittedAt text NOT NULL,
  `read` int NOT NULL DEFAULT 0,
  sourcePage text
);

CREATE TABLE IF NOT EXISTS plugin_partners (
  pageId varchar(191) NOT NULL PRIMARY KEY,
  icon text NOT NULL,
  logo text,
  href text NOT NULL,
  discountLabel text,
  couponCode text,
  `order` int NOT NULL DEFAULT 99,
  active int NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS plugin_protocol_items (
  pageId varchar(191) NOT NULL PRIMARY KEY,
  icon text NOT NULL,
  `order` int NOT NULL DEFAULT 99
);

CREATE TABLE IF NOT EXISTS plugin_testimonials (
  pageId varchar(191) NOT NULL PRIMARY KEY,
  authorTitle text NOT NULL,
  authorDesignation text,
  initials text NOT NULL,
  quote text NOT NULL,
  avatar text,
  featured int NOT NULL DEFAULT 0,
  `order` int NOT NULL DEFAULT 99
);

CREATE TABLE IF NOT EXISTS plugin_youtube_videos (
  pageId varchar(191) NOT NULL PRIMARY KEY,
  videoId text NOT NULL,
  thumbnail text NOT NULL,
  `order` int NOT NULL DEFAULT 99,
  featured int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS plugin_podcast_episodes (
  pageId varchar(191) NOT NULL PRIMARY KEY,
  episodeNumber int NOT NULL,
  dateDuration text NOT NULL,
  thumbnail text NOT NULL,
  listenUrl text,
  excerpt text,
  publishedAt text NOT NULL,
  featured int NOT NULL DEFAULT 0
);
CREATE UNIQUE INDEX IF NOT EXISTS plugin_podcast_episodes_episodeNumber
  ON plugin_podcast_episodes (episodeNumber);

CREATE TABLE IF NOT EXISTS plugin_site_config (
  id varchar(191) NOT NULL PRIMARY KEY,
  siteName text NOT NULL,
  tagline text NOT NULL,
  heroImage text NOT NULL,
  aboutImage text NOT NULL,
  podcastBgImage text NOT NULL,
  podcastBgImagenew text,
  testimonialsBgImage text NOT NULL,
  youtubeChannelUrl text NOT NULL,
  socialInstagram text,
  socialFacebook text,
  socialX text,
  socialYoutube text,
  socialTikTok text,
  statFollowers text NOT NULL,
  statExperience text NOT NULL,
  statCredentials text NOT NULL,
  statsHeading text,
  statsBody longtext,
  podcastHeroTitle text,
  podcastHeroSubtitle longtext,
  applePodcastsUrl text,
  podcastRankApple text,
  podcastRankSpotify text,
  podcastDownloads text,
  aboutTitle text,
  aboutDescription longtext,
  youtubeSectionHeading text,
  partnersSectionHeading text,
  partnersSectionSubtitle longtext,
  testimonialsHeroTitle text,
  copyrightYear int,
  partnersHeroImage text,
  partnersHeroTitle text,
  partnersHeroSubtitle longtext,
  partnerFormImage text,
  partnerFormHeading text,
  podcastGuestImage text,
  protocolHeroImage text,
  protocolHeroTitle text,
  protocolIntroTitle text,
  protocolIntroBody text,
  protocolCtaTitle text,
  protocolCtaBody text,
  aboutHeroImage text,
  aboutHeroTitle longtext,
  aboutPurposeTitle text,
  aboutPurposeVideoUrl text,
  aboutPurposeButtonText text,
  aboutPurposeButtonUrl text,
  podcastEmbedIframe longtext,
  podcastHeroImage text,
  podcastRankAppleLabel text,
  podcastRankSpotifyLabel text,
  podcastDownloadsLabel text,
  podcastGuestFormHeading text
);
