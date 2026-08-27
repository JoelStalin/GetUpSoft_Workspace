import { prepareOnly } from '../apps/orca/src/careerai/prepare-only.mjs';

console.log(JSON.stringify(prepareOnly(process.argv[2] || 'indeed-remote-valid')));
