import * as youtubeVideos from '../content-types/youtube-videos.mjs';
import { makeHandlers } from '../lib/handlers.mjs';

export const { onCreate, onEdit, onDelete } = makeHandlers(youtubeVideos);
