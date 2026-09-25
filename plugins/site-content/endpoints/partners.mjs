import * as partners from '../content-types/partners.mjs';
import { makeHandlers } from '../lib/handlers.mjs';

export const { onCreate, onEdit, onDelete } = makeHandlers(partners);
