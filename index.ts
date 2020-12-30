import YAML from 'yaml';
import { existsSync, readFileSync } from 'fs';
import { spawnSync } from 'child_process';
import path from 'path';

// Get directory.
if (process.argv.length < 3) {
  console.error('Argument required: path to source directory');
  process.exit(1);
}
process.chdir(process.argv[2]);

// Get inputs.
const {INPUT_REGISTRY, INPUT_REPOSITORY, INPUT_USERNAME, INPUT_PASSWORD, INPUT_PUSH, INPUT_PATH} = process.env;
if (!INPUT_REPOSITORY) {
  console.error('Missing env variable: INPUT_REPOSITORY');
  process.exit(1);
}

// Docker requires the repo name to be lowercase.
const repoName = `${INPUT_REGISTRY}/${INPUT_REPOSITORY.toLowerCase()}`;

// Parse ww-versions.yml.
let dockerBuildArgs: string[] = [];
const filePath = path.join(INPUT_PATH || '.', 'ww-versions.yml')
if (!existsSync(filePath)) {
  console.debug('No ww-versions.yml found');
}
else {
  const versionsFile = readFileSync(path.join(INPUT_PATH || '.', 'ww-versions.yml'), 'utf8');
  const versions = YAML.parse(versionsFile);

  // Build a list of docker 'build args' from the versions.
  if (versions) {
    dockerBuildArgs = Object.keys(versions).map(k => `VERSION_${k.toUpperCase()}=${versions[k].version}`);
  }
}

// Login before build in case we need to pull any images.
if ((INPUT_PUSH && INPUT_PUSH != '0') || (INPUT_PASSWORD && INPUT_USERNAME)) {
  const loginCmd = `echo "${INPUT_PASSWORD}" | docker login -u ${INPUT_USERNAME} --password-stdin ${INPUT_REGISTRY}`;
  const ret = spawnSync('sh', ['-c', loginCmd], {stdio: 'inherit'});
  if (ret.status) {
    console.error('Login failed');
    process.exit(1);
  }
}

// Build.
const buildCmdArgs = [
  'build',
  '-t',
  repoName,
];
dockerBuildArgs.forEach(arg => buildCmdArgs.push('--build-arg', arg));
buildCmdArgs.push('.');
let ret = spawnSync('docker', buildCmdArgs, {stdio: 'inherit'});
if (ret.status) {
  console.error('Image failed to build');
  process.exit(1);
}

// Push.
if (INPUT_PUSH && INPUT_PUSH != '0') {
  ret = spawnSync('docker', ['push', repoName], {stdio: 'inherit'});
  if (ret.status) {
    console.error('Push failed');
    process.exit(1);
  }
}
