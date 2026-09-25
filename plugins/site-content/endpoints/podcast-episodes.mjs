import * as podcastEpisodes from '../content-types/podcast-episodes.mjs';
import { makeHandlers } from '../lib/handlers.mjs';

export const { onCreate, onEdit, onDelete } = makeHandlers(podcastEpisodes);
