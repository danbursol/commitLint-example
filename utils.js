const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const NodeGit = require('nodegit');

function transformCommitRawToObject(inputObject) {
  const outputObject = {};
  for (const item of inputObject) {
    outputObject[item.type] = item.value;
  }
  return outputObject;
}
async function updatePythonVersion(updatedPythonVersion, pythonPathVersionFile) {
  if (updatedPythonVersion) {
    await editVersionOfPythonFile(pythonPathVersionFile, updatedPythonVersion);
    console.log(`Version Updated Python: ${updatedPythonVersion}`);
  }
}
async function updateNodeVersionFile(updatedNodeVersion, nodePathVersionFile) {
  if (updatedNodeVersion) {
    const fileVersion = JSON.parse(await readFile(nodePathVersionFile, 'utf8'));
    fileVersion.version = updatedNodeVersion;
    await writeFile(nodePathVersionFile, JSON.stringify(fileVersion, null, 2));
    console.log(`Version Updated Node: ${updatedNodeVersion}`);
  }
}
function bumpVersion(currentVersion, bumpType) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);

  if (bumpType === 'major') {
    console.log('major');
    return `${major + 1}.0.0`;
  } else if (bumpType === 'minor') {
    console.log('minor', `${major}.${minor + 1}.0`);
    return `${major}.${minor + 1}.0`;
  } else if (bumpType === 'patch') {
    console.log('patch');
    return `${major}.${minor}.${patch + 1}`;
  }
}
function findVersionBump(commit_parsed) {
  try {
    let versionBump = 'patch';
    if (commit_parsed.type === 'feat') {
      versionBump = 'minor';
    }
    if (commit_parsed['breaking-change']) {
      versionBump = 'major';
    }
    return versionBump;
  } catch (error) {
    return null;
  }
}
function execCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout.trim());
      }
    });
  });
}
function getVersionFromPythonFile(filePath) {
  try {
    const fileData = fs.readFileSync(filePath, 'utf8');
    // Getting Version
    const versionLine = fileData.split('\n').find((line) => line.includes('version='));
    const version = versionLine.match(/'([^']+)'/)[1]; // Extrae la versión entre comillas
    return version;
  } catch (error) {
    console.error('Error when try to read file:', error);
    return null;
  }
}
function editVersionOfPythonFile(filePath, newVersion) {
  try {
    let fileData = fs.readFileSync(filePath, 'utf8');
    // Get Version
    fileData = fileData.replace(/(version=')[^']+'/g, `$1${newVersion}'`);
    fs.writeFileSync(filePath, fileData, 'utf8');
    console.log('Version updated correctly.');
  } catch (error) {
    console.error('Error when try to edit file:', error);
  }
}
function parseConventionalCommit(message) {
  const commitRegex = /^(?<type>\w+)\((?<scope>[\w/]+)\)(!?)\s?:\s?(?<description>.*)$/;
  const match = message.match(commitRegex);

  if (match) {
    const { type, description } = match.groups;
    let { scope } = match.groups;
    const result = { type, description };
    if (scope) {
      result.scope = scope;
    }

    if (message.includes('!') || message.includes('BREAKING CHANGES')) {
      result['breaking-change'] = true;
    }

    return result;
  } else {
    console.error('Commit message does not follow Conventional Commits format');
    return null;
  }
}

async function commitAndPush( accessToken) {
  const repoPath = './'; 
  const branch = 'master'; 
  const commitMessage = 'chore(version): bump up version';
  try {
    const repository = await NodeGit.Repository.open(repoPath);

    // Obtener el remote (repositorio remoto)
    const remote = await repository.getRemote('origin');

    // Crear el commit
    const index = await repository.refreshIndex();
    await index.addAll();
    await index.write();
    
    const oid = await index.writeTree();
    const head = await NodeGit.Reference.nameToId(repository, `refs/heads/${branch}`);
    const parent = await repository.getCommit(head);

    const author = NodeGit.Signature.now('VersionBumper', 'VersionBumper@email.com');
    const committer = NodeGit.Signature.now('VersionBumper', 'VersionBumper@email.com');

    const commitId = await repository.createCommit(
      'HEAD',
      author,
      committer,
      commitMessage,
      oid,
      [parent],
    );

    console.log(`Commit created: ${commitId.tostrS()}`);

    // Realizar el push
    await remote.push(
      [`refs/heads/${branch}:refs/heads/${branch}`],
      {
        callbacks: {
          credentials: function() {
            return NodeGit.Cred.userpassPlaintextNew(accessToken, 'x-oauth-basic');
          },
        },
      },
    );

    console.log('Push OK.');
  } catch (error) {
    console.error('Error:', error);
  }
}



module.exports = {
  parseConventionalCommit,
  execCommand,
  bumpVersion,
  transformCommitRawToObject,
  getVersionFromPythonFile,
  findVersionBump,
  updatePythonVersion,
  updateNodeVersionFile,
  commitAndPush
};
