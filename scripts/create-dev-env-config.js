// scripts/generate-env-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 源模板和目標文件
const templatePath = path.resolve(rootDir, 'public/env-config.js');
const outputPath = path.resolve(rootDir, 'dist/env-config.js');

// 函數：獲取 Git 信息
function getGitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD').toString().trim();
    const branch = execSync('git rev-parse --abbrev-ref HEAD')
      .toString()
      .trim();
    return { commitHash, branch };
  } catch (error) {
    console.warn('無法獲取 Git 信息:', error.message);
    return { commitHash: 'unknown', branch: 'unknown' };
  }
}

// 讀取環境變數
function readEnvVars() {
  let envVars = {};

  // 首先嘗試讀取 .env.production 文件
  try {
    const envFilePath = path.resolve(rootDir, '.env.production');
    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, 'utf8');
      // 解析 KEY=VALUE 格式
      envFileContent.split('\n').forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
          if (match) {
            // 移除值周圍的引號（如果有的話）
            let value = match[2] || '';
            if (
              (value.startsWith('"') && value.endsWith('"')) ||
              (value.startsWith("'") && value.endsWith("'"))
            ) {
              value = value.slice(1, -1);
            }
            envVars[match[1]] = value;
          }
        }
      });
      console.log(`✅ 讀取環境變數文件: ${envFilePath}`);
    }
  } catch (error) {
    console.warn('讀取環境變數文件失敗:', error.message);
  }

  // 從 package.json 獲取版本
  try {
    const packageJsonPath = path.resolve(rootDir, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (!envVars.VITE_APP_VERSION && packageJson.version) {
      envVars.VITE_APP_VERSION = packageJson.version;
    }
  } catch (error) {
    console.warn('讀取 package.json 失敗:', error.message);
  }

  // 獲取 Git 信息
  const gitInfo = getGitInfo();

  // 設置默認值或覆蓋值
  if (!envVars.VITE_APP_VERSION) envVars.VITE_APP_VERSION = '1.0.0.0';
  if (!envVars.VITE_APP_BUILD_TIME)
    envVars.VITE_APP_BUILD_TIME = new Date().toISOString();
  if (!envVars.VITE_APP_BUILD_ID)
    envVars.VITE_APP_BUILD_ID = gitInfo.commitHash;
  if (!envVars.VITE_APP_GIT_BRANCH)
    envVars.VITE_APP_GIT_BRANCH = gitInfo.branch;
  if (!envVars.MODE) envVars.MODE = 'production';

  return envVars;
}

// 創建默認模板
function createDefaultTemplate() {
  const templateDir = path.dirname(templatePath);
  if (!fs.existsSync(templateDir)) {
    fs.mkdirSync(templateDir, { recursive: true });
  }

  const defaultTemplate = `// 這個文件在構建過程中會被動態生成
// 包含應用程序的環境配置信息
window.ENV = {
  // 應用版本號
  VITE_APP_VERSION: '%VITE_APP_VERSION%',
  
  // 構建時間
  VITE_APP_BUILD_TIME: '%VITE_APP_BUILD_TIME%',
  
  // Git Commit Hash 或構建 ID
  VITE_APP_BUILD_ID: '%VITE_APP_BUILD_ID%',
  
  // Git 分支
  VITE_APP_GIT_BRANCH: '%VITE_APP_GIT_BRANCH%',
  
  // 構建模式
  MODE: '%MODE%',
  
  // 其他自定義環境變數可以在這裡添加
  // VITE_APP_API_URL: '%VITE_APP_API_URL%',
  // VITE_APP_TITLE: '%VITE_APP_TITLE%'
};

// 提供一個全局函數來獲取環境配置
window.getEnvConfig = function() {
  return window.ENV;
};

// 在控制台輸出版本信息（僅在開發模式下）
if (window.ENV.MODE === 'development') {
  console.log('🚀 應用版本:', window.ENV.VITE_APP_VERSION);
  console.log('⏰ 構建時間:', window.ENV.VITE_APP_BUILD_TIME);
  console.log('🌿 Git 分支:', window.ENV.VITE_APP_GIT_BRANCH);
}`;

  fs.writeFileSync(templatePath, defaultTemplate);
  console.log(`✅ 創建默認模板: ${templatePath}`);
}

// 替換模板中的變數
function generateEnvConfig() {
  // 確保構建目錄存在
  const buildDir = path.dirname(outputPath);
  if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
    console.log(`✅ 創建目錄: ${buildDir}`);
  }

  try {
    // 檢查模板文件是否存在，如果不存在則創建
    if (!fs.existsSync(templatePath)) {
      console.log(`📝 模板文件不存在，創建默認模板...`);
      createDefaultTemplate();
    }

    // 讀取環境變數
    const envVars = readEnvVars();

    console.log('📋 環境變數:');
    Object.entries(envVars).forEach(([key, value]) => {
      console.log(`   ${key}: ${value}`);
    });

    // 讀取模板
    let template = fs.readFileSync(templatePath, 'utf8');

    // 替換所有變數
    Object.keys(envVars).forEach((key) => {
      const placeholder = `%${key}%`;
      const regex = new RegExp(
        placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
        'g'
      );
      template = template.replace(regex, envVars[key]);
    });

    // 檢查是否還有未替換的佔位符
    const remainingPlaceholders = template.match(/%[A-Z_]+%/g);
    if (remainingPlaceholders) {
      console.warn('⚠️  發現未替換的佔位符:', remainingPlaceholders);
    }

    // 寫入輸出文件
    fs.writeFileSync(outputPath, template);
    console.log(`✅ 生成環境配置文件: ${outputPath}`);

    // 驗證生成的文件
    const stats = fs.statSync(outputPath);
    console.log(`📊 文件大小: ${stats.size} bytes`);

    return true;
  } catch (error) {
    console.error('❌ 生成環境配置文件失敗:', error.message);
    console.error(error.stack);
    return false;
  }
}

// 清理函數：刪除生成的文件
function cleanEnvConfig() {
  try {
    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      console.log(`🗑️  已刪除: ${outputPath}`);
    }
  } catch (error) {
    console.error('清理失敗:', error.message);
  }
}

// 如果直接運行此腳本
if (import.meta.url === `file://${process.argv[1]}`) {
  const command = process.argv[2];

  switch (command) {
    case 'clean':
      cleanEnvConfig();
      break;
    case 'generate':
    default:
      generateEnvConfig();
      break;
  }
}

// 導出函數以供其他模塊使用
export { generateEnvConfig, cleanEnvConfig };
