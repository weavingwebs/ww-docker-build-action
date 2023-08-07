// Parse ww-versions.yml.
import path from 'path';
import { existsSync, readFileSync } from 'fs';
import YAML from 'yaml';
import { spawnSync } from 'child_process';

type BuildInput = {
  repoName: string;
  customBuildArgs?: Record<string, string>;
}

export function build({repoName, customBuildArgs}: BuildInput): boolean {
  let dockerBuildArgs: string[] = [];
  const filePath = path.join('.', 'ww-versions.yml')
  if (!existsSync(filePath)) {
    console.debug('No ww-versions.yml found');
  }
  else {
    const versionsFile = readFileSync(filePath, 'utf8');
    const versions = YAML.parse(versionsFile);

    // Build a list of docker 'build args' from the versions.
    if (versions) {
      dockerBuildArgs = Object.keys(versions).map(k => `VERSION_${k.toUpperCase()}=${versions[k].version}`);
    }
  }

  // Merge in custom build args.
  if (customBuildArgs) {
    Object.entries(customBuildArgs).forEach(([k, v]) => {
      dockerBuildArgs.push(`${k}=${v}`);
    });
  }

  // Build.
  const buildCmdArgs = [
    'build',
    '-t',
    repoName,
  ];
  dockerBuildArgs.forEach(arg => buildCmdArgs.push('--build-arg', arg));
  buildCmdArgs.push('.');
  const ret = spawnSync('docker', buildCmdArgs, {stdio: 'inherit'});
  return !ret.status;
}
