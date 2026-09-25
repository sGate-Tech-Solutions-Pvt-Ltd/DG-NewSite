// Shared list of site-content page types, kept separate from index.mjs so it
// can be imported from a plain Astro API route too, without pulling in
// `studiocms/plugins` (definePlugin), which is only safe to import from
// within the integration/build context.
import * as partners from '../content-types/partners.mjs';
import * as testimonials from '../content-types/testimonials.mjs';
import * as youtubeVideos from '../content-types/youtube-videos.mjs';
import * as podcastEpisodes from '../content-types/podcast-episodes.mjs';
import * as protocolItems from '../content-types/protocol-items.mjs';

export const contentTypes = [partners, testimonials, youtubeVideos, podcastEpisodes, protocolItems];

export function findContentType(identifier) {
  return contentTypes.find((ct) => ct.identifier === identifier);
}
