import { syncFastlaneContentIfNeeded } from '../server/content-db.mjs';

console.log(JSON.stringify(syncFastlaneContentIfNeeded(), null, 2));
