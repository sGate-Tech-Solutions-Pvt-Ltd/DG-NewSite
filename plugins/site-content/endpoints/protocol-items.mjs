import * as protocolItems from '../content-types/protocol-items.mjs';
import { makeHandlers } from '../lib/handlers.mjs';

export const { onCreate, onEdit, onDelete } = makeHandlers(protocolItems);
