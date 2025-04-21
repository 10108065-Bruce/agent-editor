// scripts/update-version.js
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 函數：獲取當前 Git Commit Hash
function getGitCommitHash() {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch (e) {
    console.error('無法獲取 Git Commit Hash:', e.message);
    return 'unknown';
  }
}

// 函數：獲取當前 Git 分支
function getGitBranch() {
  try {
    return execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch (e) {
    console.error('無法獲取 Git 分支:', e.message);
    return 'unknown';
  }
}

// 函數：讀取 package.json
function readPackageJson() {
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  } catch (e) {
    console.error('無法讀取 package.json:', e.message);
    process.exit(1);
  }
}

// 函數：更新版本號（根據構建類型）
function updateVersion(packageJson, buildType = 'patch') {
  const version = packageJson.version || '0.0.0';
  const [major, minor, patch] = version.split('.').map(Number);

  switch (buildType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// 函數：寫入 package.json
function writePackageJson(packageJson) {
  const packageJsonPath = path.resolve(rootDir, 'package.json');
  try {
    fs.writeFileSync(
      packageJsonPath,
      JSON.stringify(packageJson, null, 2) + '\n'
    );
    console.log(`✅ package.json 已更新，版本: ${packageJson.version}`);
  } catch (e) {
    console.error('無法寫入 package.json:', e.message);
    process.exit(1);
  }
}

// 函數：創建環境變數文件
function createEnvFile(version, commitHash, branch) {
  const envContent = `
VITE_APP_VERSION=${version}
VITE_APP_BUILD_TIME=${new Date().toISOString()}
VITE_APP_BUILD_ID=${commitHash}
VITE_APP_GIT_BRANCH=${branch}
`;

  const envPath = path.resolve(rootDir, '.env.production');
  try {
    fs.writeFileSync(envPath, envContent.trim());
    console.log(`✅ 環境變數文件已創建: ${envPath}`);
  } catch (e) {
    console.error('無法創建環境變數文件:', e.message);
    process.exit(1);
  }
}

// 主函數
function main() {
  // 獲取構建類型參數
  const buildType = process.argv[2] || 'patch';
  if (!['major', 'minor', 'patch'].includes(buildType)) {
    console.error('無效的構建類型。請使用: major, minor, 或 patch');
    process.exit(1);
  }

  // 讀取 package.json
  const packageJson = readPackageJson();

  // 獲取 Git 信息
  const commitHash = getGitCommitHash();
  const branch = getGitBranch();

  // 更新版本號
  const oldVersion = packageJson.version;
  packageJson.version = updateVersion(packageJson, buildType);

  // 寫入 package.json
  writePackageJson(packageJson);

  // 創建環境變數文件
  createEnvFile(packageJson.version, commitHash, branch);

  console.log(`🚀 版本已更新: ${oldVersion} → ${packageJson.version}`);
  console.log(`📝 Git Commit: ${commitHash}`);
  console.log(`🌿 Git 分支: ${branch}`);
}

// 執行主函數
main();
