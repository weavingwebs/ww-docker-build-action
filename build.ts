/**
 * Helper script to test ww-versions.yml builds locally.
 */

// Get image name.
import { build } from './lib';

if (process.argv.length < 3) {
  console.error('Argument required: image name');
  process.exit(1);
}
const repoName = process.argv[2];

// Build.
if (!build({repoName})) {
  console.error('Image failed to build');
  process.exit(1);
}
