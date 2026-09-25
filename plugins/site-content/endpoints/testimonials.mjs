import * as testimonials from '../content-types/testimonials.mjs';
import { makeHandlers } from '../lib/handlers.mjs';

export const { onCreate, onEdit, onDelete } = makeHandlers(testimonials);
