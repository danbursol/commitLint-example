const {
  execCommand,
  parseConventionalCommit,
  bumpVersion,
  updatePythonVersion,
  updateNodeVersionFile,
  findVersionBump,
  getVersionFromPythonFile,
  commitAndPush
  
} = require('./utils.js');
const process = require('process');

const token_github = process.argv[2]

const nodePathVersionFile = './node/package.json';
const pythonPathVersionFile = './python/setup.py';

async function main() {
  const rawCommits = await execCommand('git show --oneline --format=%s HEAD');

  const commitTitle = rawCommits.split('\n\ndiff --git')[0];
  const commitObject = parseConventionalCommit(commitTitle);

  let updatedNodeVersion, updatedPythonVersion, versionBump;

  versionBump = findVersionBump(commitObject);

  if (versionBump === null) return -1;

  if (commitObject.scope == 'python') {
    let currentPythonVersion = getVersionFromPythonFile(pythonPathVersionFile);
    updatedPythonVersion = bumpVersion(currentPythonVersion, versionBump);
    console.log(versionBump);
  } else if (commitObject.scope == 'node') {
    let currentNodeVersion = require(nodePathVersionFile).version;
    updatedNodeVersion = bumpVersion(currentNodeVersion, versionBump);
    console.log(versionBump);
  } else {
    console.log("Can't specify scope.");
    return -1;
  }

  updatePythonVersion(updatedPythonVersion, pythonPathVersionFile);
  updateNodeVersionFile(updatedNodeVersion, nodePathVersionFile);
  commitAndPush(token_github)
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
