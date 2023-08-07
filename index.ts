import { spawnSync } from 'child_process';
import { build } from './lib';
import YAML from 'yaml';

// Get directory.
if (process.argv.length < 3) {
  console.error('Argument required: path to source directory');
  process.exit(1);
}
process.chdir(process.argv[2]);

// Get inputs.
const {INPUT_REGISTRY, INPUT_REPOSITORY, INPUT_USERNAME, INPUT_PASSWORD, INPUT_PUSH, INPUT_PATH, INPUT_BUILD_ARGS} = process.env;
if (!INPUT_REPOSITORY) {
  console.error('Missing env variable: INPUT_REPOSITORY');
  process.exit(1);
}

// Docker requires the repo name to be lowercase.
const repoName = `${INPUT_REGISTRY}/${INPUT_REPOSITORY.toLowerCase()}`;

// Login before build in case we need to pull any images.
if (INPUT_PUSH && INPUT_PUSH === '1' && INPUT_PASSWORD && INPUT_USERNAME) {
  const loginCmd = `echo "${INPUT_PASSWORD}" | docker login -u ${INPUT_USERNAME} --password-stdin ${INPUT_REGISTRY}`;
  const ret = spawnSync('sh', ['-c', loginCmd], {stdio: 'inherit'});
  if (ret.status) {
    console.error('Login failed');
    process.exit(1);
  }
}

// Parse build args if provided.
let customBuildArgs: Record<string, string>|undefined;
if (INPUT_BUILD_ARGS) {
  customBuildArgs = YAML.parse(INPUT_BUILD_ARGS);
}

// Build.
if (!build({repoName, inputPath: INPUT_PATH, customBuildArgs})) {
  console.error('Image failed to build');
  process.exit(1);
}

// Push.
if (INPUT_PUSH && INPUT_PUSH != '0') {
  const ret = spawnSync('docker', ['push', repoName], {stdio: 'inherit'});
  if (ret.status) {
    console.error('Push failed');
    process.exit(1);
  }
}
