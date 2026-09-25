import { getPool } from './db';
import { withBase } from './withBase';

// Every read filters on the page's own `draft` flag (respected regardless of
// content type — it's the standard StudioCMS editor toggle), so unpublishing
// a page in the dashboard hides it here too, without touching plugin tables.

export interface Partner {
  name: string;
  description: string;
  icon: string;
  logo: string | null;
  href: string;
  discountLabel: string | null;
  couponCode: string | null;
  order: number;
  active: boolean;
}

export async function getPartners(): Promise<Partner[]> {
  const [rows] = await getPool().query(
    `SELECT p.title AS name, p.description, pp.icon, pp.logo, pp.href,
            pp.discountLabel, pp.couponCode, pp.\`order\` AS \`order\`, pp.active
     FROM plugin_partners pp
     JOIN StudioCMSPageData p ON p.id = pp.pageId
     WHERE p.draft = 0
     ORDER BY pp.\`order\` ASC`
  );
  return (rows as any[]).map((r) => ({ ...r, logo: withBase(r.logo), active: !!r.active }));
}

export interface Testimonial {
  authorName: string;
  authorTitle: string;
  initials: string;
  quote: string;
  avatar: string | null;
  featured: boolean;
  order: number;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const [rows] = await getPool().query(
    `SELECT p.title AS authorName, pt.authorTitle, pt.initials, pt.quote, pt.avatar,
            pt.featured, pt.\`order\` AS \`order\`
     FROM plugin_testimonials pt
     JOIN StudioCMSPageData p ON p.id = pt.pageId
     WHERE p.draft = 0
     ORDER BY pt.\`order\` ASC`
  );
  return (rows as any[]).map((r) => ({ ...r, avatar: withBase(r.avatar), featured: !!r.featured }));
}

export interface YoutubeVideo {
  title: string;
  videoId: string;
  thumbnail: string;
  order: number;
  featured: boolean;
}

export async function getYoutubeVideos(): Promise<YoutubeVideo[]> {
  const [rows] = await getPool().query(
    `SELECT p.title, pv.videoId, pv.thumbnail, pv.\`order\` AS \`order\`, pv.featured
     FROM plugin_youtube_videos pv
     JOIN StudioCMSPageData p ON p.id = pv.pageId
     WHERE p.draft = 0
     ORDER BY pv.\`order\` ASC`
  );
  return (rows as any[]).map((r) => ({ ...r, thumbnail: withBase(r.thumbnail), featured: !!r.featured }));
}

export interface PodcastEpisode {
  episodeNumber: number;
  title: string;
  dateDuration: string;
  thumbnail: string;
  listenUrl: string | null;
  excerpt: string | null;
  description: string;
  publishedAt: string;
  featured: boolean;
}

export async function getPodcastEpisodes(): Promise<PodcastEpisode[]> {
  const [rows] = await getPool().query(
    `SELECT pe.episodeNumber, p.title, pe.dateDuration, pe.thumbnail, pe.listenUrl,
            pe.excerpt, p.description, pe.publishedAt, pe.featured
     FROM plugin_podcast_episodes pe
     JOIN StudioCMSPageData p ON p.id = pe.pageId
     WHERE p.draft = 0
     ORDER BY pe.episodeNumber DESC`
  );
  return (rows as any[]).map((r) => ({ ...r, thumbnail: withBase(r.thumbnail), featured: !!r.featured }));
}

export interface ProtocolItem {
  title: string;
  icon: string;
  description: string;
  order: number;
}

export async function getProtocolItems(): Promise<ProtocolItem[]> {
  const [rows] = await getPool().query(
    `SELECT p.title, pi.icon, p.description, pi.\`order\` AS \`order\`
     FROM plugin_protocol_items pi
     JOIN StudioCMSPageData p ON p.id = pi.pageId
     WHERE p.draft = 0
     ORDER BY pi.\`order\` ASC`
  );
  return rows as ProtocolItem[];
}

export interface SiteConfig {
  siteName: string;
  tagline: string;
  heroImage: string;
  aboutImage: string;
  podcastBgImage: string;
  podcastBgImagenew: string;
  testimonialsBgImage: string;
  youtubeChannelUrl: string;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialX: string | null;
  socialYoutube: string | null;
  socialTikTok: string | null;
  statFollowers: string;
  statExperience: string;
  statCredentials: string;
  statsHeading: string | null;
  statsBody: string | null;
  podcastHeroTitle: string | null;
  podcastHeroSubtitle: string | null;
  podcastRankApple: string | null;
  podcastRankSpotify: string | null;
  podcastDownloads: string | null;
  aboutTitle: string | null;
  aboutDescription: string | null;
  youtubeSectionHeading: string | null;
  partnersSectionHeading: string | null;
  partnersSectionSubtitle: string | null;
  testimonialsHeroTitle: string | null;
  copyrightYear: number;
  partnersHeroImage: string | null;
  partnersHeroTitle: string | null;
  partnersHeroSubtitle: string | null;
  partnerFormImage: string | null;
  partnerFormHeading: string | null;
  podcastGuestImage: string | null;
  protocolHeroImage: string | null;
  protocolHeroTitle: string | null;
  protocolIntroTitle: string | null;
  protocolIntroBody: string | null;
  protocolCtaTitle: string | null;
  protocolCtaBody: string | null;
  aboutHeroImage: string | null;
  aboutHeroTitle: string | null;
  aboutPurposeTitle: string | null;
  aboutPurposeVideoUrl: string | null;
  aboutPurposeButtonText: string | null;
  aboutPurposeButtonUrl: string | null;
  podcastEmbedIframe: string | null;
  podcastHeroImage: string | null;
  podcastRankAppleLabel: string | null;
  podcastRankSpotifyLabel: string | null;
  podcastDownloadsLabel: string | null;
  podcastGuestFormHeading: string | null;
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const [rows] = await getPool().query(
    `SELECT * FROM plugin_site_config WHERE id = 'default' LIMIT 1`
  );
  const row = (rows as any[])[0] ?? {};
  return {
    ...row,
    heroImage: withBase(row.heroImage),
    aboutImage: withBase(row.aboutImage),
    podcastBgImage: withBase(row.podcastBgImage),
    podcastBgImagenew: withBase(row.podcastBgImagenew),
    testimonialsBgImage: withBase(row.testimonialsBgImage),
    partnersHeroImage: withBase(row.partnersHeroImage),
    partnerFormImage: withBase(row.partnerFormImage),
    podcastGuestImage: withBase(row.podcastGuestImage),
    protocolHeroImage: withBase(row.protocolHeroImage),
    aboutHeroImage: withBase(row.aboutHeroImage),
    podcastHeroImage: withBase(row.podcastHeroImage),
    copyrightYear: row.copyrightYear ?? new Date().getFullYear(),
  };
}
