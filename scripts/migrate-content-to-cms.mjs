#!/usr/bin/env node
// One-off backfill: copy the local astro:content JSON collections into
// StudioCMS-managed pages (StudioCMSPageData/PageContent) + the site-content
// plugin's own tables, so editors can manage this content from the dashboard
// instead of hand-editing JSON files. Bypasses the dashboard API entirely
// (this is a bulk import, not simulating clicks) — mirrors the style of
// scripts/migrate-sqlite-to-mysql.mjs.
//
// Usage: node scripts/migrate-content-to-cms.mjs

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const ADMIN_USER_ID = 'f0cf46b1-13c8-43c9-8f4c-249646b7b4f2'; // 'studiocms' / Arti Sharma, already migrated
const CONTENT_DIR = new URL('../src/content/', import.meta.url).pathname;

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function readJsonDir(dirName) {
  const dir = path.join(CONTENT_DIR, dirName);
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith('.json'));
  const items = [];
  for (const file of files) {
    const raw = await fs.readFile(path.join(dir, file), 'utf8');
    items.push(JSON.parse(raw));
  }
  return items;
}

async function insertPage(pool, { pkg, title, description, slug, heroImage, draft }) {
  const pageId = crypto.randomUUID();
  const now = new Date().toISOString();
  await pool.query(
    `INSERT INTO StudioCMSPageData
     (id, package, title, description, showOnNav, publishedAt, updatedAt, slug, contentLang,
      heroImage, categories, tags, authorId, contributorIds, showAuthor, showContributors,
      parentFolder, draft, augments)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      pageId, pkg, title, description || title, 0, now, now, slug, 'default',
      heroImage ?? null, '[]', '[]', ADMIN_USER_ID, '[]', 0, 0,
      null, draft ? 1 : 0, '[]',
    ]
  );
  await pool.query(
    `INSERT INTO StudioCMSPageContent (id, contentId, contentLang, content) VALUES (?,?,?,?)`,
    [crypto.randomUUID(), pageId, 'default', '']
  );
  return pageId;
}

async function migratePartners(pool) {
  const items = await readJsonDir('partners');
  for (const item of items) {
    const pageId = await insertPage(pool, {
      pkg: 'site-content/partner',
      title: item.name,
      description: item.description,
      slug: slugify(`partner-${item.name}`),
      heroImage: item.logo,
      draft: !item.active,
    });
    await pool.query(
      `INSERT INTO plugin_partners (pageId, icon, logo, href, discountLabel, couponCode, \`order\`, active)
       VALUES (?,?,?,?,?,?,?,?)`,
      [pageId, item.icon ?? 'fa-star', item.logo ?? null, item.href, item.discountLabel ?? null,
       item.couponCode ?? null, item.order ?? 99, item.active ? 1 : 0]
    );
  }
  console.log(`  partners: migrated ${items.length} item(s)`);
}

async function migrateTestimonials(pool) {
  const items = await readJsonDir('testimonials');
  for (const item of items) {
    const pageId = await insertPage(pool, {
      pkg: 'site-content/testimonial',
      title: item.authorName,
      description: item.quote,
      slug: slugify(`testimonial-${item.authorName}`),
      heroImage: item.avatar,
      draft: false,
    });
    await pool.query(
      `INSERT INTO plugin_testimonials (pageId, authorTitle, initials, quote, avatar, featured, \`order\`)
       VALUES (?,?,?,?,?,?,?)`,
      [pageId, item.authorTitle, item.initials, item.quote, item.avatar ?? null,
       item.featured ? 1 : 0, item.order ?? 99]
    );
  }
  console.log(`  testimonials: migrated ${items.length} item(s)`);
}

async function migrateYoutubeVideos(pool) {
  const items = await readJsonDir('youtube-videos');
  for (const item of items) {
    const pageId = await insertPage(pool, {
      pkg: 'site-content/youtube-video',
      title: item.title,
      description: item.title,
      slug: slugify(`video-${item.title}`),
      heroImage: item.thumbnail,
      draft: false,
    });
    await pool.query(
      `INSERT INTO plugin_youtube_videos (pageId, videoId, thumbnail, \`order\`, featured)
       VALUES (?,?,?,?,?)`,
      [pageId, item.videoId, item.thumbnail, item.order ?? 99, item.featured ? 1 : 0]
    );
  }
  console.log(`  youtube-videos: migrated ${items.length} item(s)`);
}

async function migrateProtocolItems(pool) {
  const items = await readJsonDir('protocol-items');
  for (const item of items) {
    const pageId = await insertPage(pool, {
      pkg: 'site-content/protocol-item',
      title: item.title,
      description: item.description,
      slug: slugify(`protocol-${item.title}`),
      draft: false,
    });
    await pool.query(
      `INSERT INTO plugin_protocol_items (pageId, icon, \`order\`) VALUES (?,?,?)`,
      [pageId, item.icon, item.order ?? 99]
    );
  }
  console.log(`  protocol-items: migrated ${items.length} item(s)`);
}

async function migratePodcastEpisodes(pool) {
  // Unlike the other collections, episodes.json wraps every episode in one
  // file as { episodes: [...] } rather than one file per item — reconcile
  // that here into one page-row-set per episode, matching the others.
  const raw = await fs.readFile(path.join(CONTENT_DIR, 'podcast-episodes', 'episodes.json'), 'utf8');
  const { episodes } = JSON.parse(raw);
  for (const item of episodes) {
    const pageId = await insertPage(pool, {
      pkg: 'site-content/podcast-episode',
      title: item.title,
      description: item.description || item.excerpt || item.title,
      slug: slugify(`episode-${item.episodeNumber}-${item.title}`),
      heroImage: item.thumbnail,
      draft: false,
    });
    await pool.query(
      `INSERT INTO plugin_podcast_episodes
       (pageId, episodeNumber, dateDuration, thumbnail, listenUrl, excerpt, publishedAt, featured)
       VALUES (?,?,?,?,?,?,?,?)`,
      [pageId, item.episodeNumber, item.dateDuration, item.thumbnail, item.listenUrl ?? null,
       item.excerpt ?? null, item.publishedAt, item.featured ? 1 : 0]
    );
  }
  console.log(`  podcast-episodes: migrated ${episodes.length} item(s)`);
}

async function migrateSiteConfig(pool) {
  // index.astro's current hardcoded `site` object — seeded directly into the
  // singleton settings table, not through the pageTypes system at all.
  const site = {
    heroImage: '/images/page1_img1.jpeg',
    podcastBgImage: '/images/page3_img1.jpeg',
    testimonialsBgImage: '/images/page1_img2.jpeg',
    aboutImage: '/images/page1_img8.jpeg',
    siteName: 'Dylan Gemelli',
    tagline: 'The Wellness Revolutionary',
    statFollowers: '1.5M+',
    statExperience: '20+',
    statCredentials: '10+',
    youtubeChannelUrl: 'https://www.youtube.com/@DylanGemelliBiohacking',
  };
  await pool.query(
    `UPDATE plugin_site_config SET
       heroImage=?, podcastBgImage=?, testimonialsBgImage=?, aboutImage=?, siteName=?,
       tagline=?, statFollowers=?, statExperience=?, statCredentials=?, youtubeChannelUrl=?
     WHERE id='default'`,
    [site.heroImage, site.podcastBgImage, site.testimonialsBgImage, site.aboutImage, site.siteName,
     site.tagline, site.statFollowers, site.statExperience, site.statCredentials, site.youtubeChannelUrl]
  );
  console.log('  site-config: seeded from index.astro defaults');
}

async function main() {
  const pool = mysql.createConnection({
    host: process.env.CMS_MYSQL_HOST,
    port: Number(process.env.CMS_MYSQL_PORT),
    user: process.env.CMS_MYSQL_USER,
    password: process.env.CMS_MYSQL_PASSWORD,
    database: process.env.CMS_MYSQL_DATABASE,
  });
  const conn = await pool;

  console.log('Migrating local JSON content into StudioCMS-managed pages...');
  try {
    await migratePartners(conn);
    await migrateTestimonials(conn);
    await migrateYoutubeVideos(conn);
    await migrateProtocolItems(conn);
    await migratePodcastEpisodes(conn);
    await migrateSiteConfig(conn);
    console.log('\nDone.');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
