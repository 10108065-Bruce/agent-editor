// scripts/generate-env-config.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 獲取當前文件的目錄路徑
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 源模板和目標文件
const templatePath = path.resolve(rootDir, 'public/env-config.js');
const outputPath = path.resolve(rootDir, 'dist/env-config.js');

// 讀取環境變數
function readEnvVars() {
  // 首先嘗試讀取 .env.production 文件
  let envVars = {};
  try {
    const envFilePath = path.resolve(rootDir, '.env.production');
    if (fs.existsSync(envFilePath)) {
      const envFileContent = fs.readFileSync(envFilePath, 'utf8');
      // 解析 KEY=VALUE 格式
      envFileContent.split('\n').forEach((line) => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          envVars[match[1]] = match[2] || '';
        }
      });
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

  // 設置默認值
  if (!envVars.VITE_APP_VERSION) envVars.VITE_APP_VERSION = '0.0.0';
  if (!envVars.VITE_APP_BUILD_TIME)
    envVars.VITE_APP_BUILD_TIME = new Date().toISOString();
  if (!envVars.VITE_APP_BUILD_ID)
    envVars.VITE_APP_BUILD_ID = 'build-' + Date.now();
  if (!envVars.MODE) envVars.MODE = 'production';

  return envVars;
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
    // 檢查模板文件是否存在
    if (!fs.existsSync(templatePath)) {
      console.log(`Creating template file at: ${templatePath}`);

      // 如果模板文件不存在，創建它
      const templateDir = path.dirname(templatePath);
      if (!fs.existsSync(templateDir)) {
        fs.mkdirSync(templateDir, { recursive: true });
      }

      // 寫入默認模板內容
      const defaultTemplate = `// This file will be created during the build process
window.ENV = {
  VITE_APP_VERSION: '%VITE_APP_VERSION%',
  VITE_APP_BUILD_TIME: '%VITE_APP_BUILD_TIME%',
  VITE_APP_BUILD_ID: '%VITE_APP_BUILD_ID%',
  MODE: '%MODE%'
};`;
      fs.writeFileSync(templatePath, defaultTemplate);
    }

    // 讀取環境變數
    const envVars = readEnvVars();
    console.log('環境變數:', envVars);

    // 讀取模板
    let template = fs.readFileSync(templatePath, 'utf8');

    // 替換所有變數
    Object.keys(envVars).forEach((key) => {
      const placeholder = `%${key}%`;
      template = template.replace(new RegExp(placeholder, 'g'), envVars[key]);
    });

    // 寫入輸出文件
    fs.writeFileSync(outputPath, template);
    console.log(`✅ 生成環境配置文件: ${outputPath}`);

    return true;
  } catch (error) {
    console.error('❌ 生成環境配置文件失敗:', error.message);
    return false;
  }
}

// 如果直接運行此腳本
generateEnvConfig();

// 導出函數以供其他模塊使用
export { generateEnvConfig };
