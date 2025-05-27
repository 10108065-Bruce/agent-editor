/**
 * 安全地獲取環境變量，適用於瀏覽器和 Vite 環境
 * @param {string} name 環境變量名稱
 * @param {any} defaultValue 默認值
 * @returns {string} 環境變量值或默認值
 */
function getEnvVar(name, defaultValue) {
  // 檢查是否在瀏覽器環境中
  if (typeof window !== 'undefined' && window.ENV && window.ENV[name]) {
    return window.ENV[name];
  }

  // 檢查是否在 Vite 應用中（通過 import.meta.env 注入的環境變量）
  if (
    typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env[name]
  ) {
    return import.meta.env[name];
  }

  // 返回默認值
  return defaultValue;
}

/**
 * 提供應用程序版本信息的服務
 */
class VersionService {
  constructor() {
    // 獲取版本號
    this.version = getEnvVar('VITE_APP_VERSION', '0.0.0');

    // 建立時間
    this.buildTime = getEnvVar('VITE_APP_BUILD_TIME', new Date().toISOString());

    // 建立 ID (例如 git commit hash)
    this.buildId = getEnvVar('VITE_APP_BUILD_ID', 'development');

    // 環境
    this.environment = getEnvVar('MODE', 'development');
  }

  /**
   * 獲取完整的版本信息
   * @returns {Object} 版本信息
   */
  getVersionInfo() {
    return {
      version: this.version,
      buildTime: this.buildTime,
      buildId: this.buildId,
      environment: this.environment
    };
  }

  /**
   * 獲取版本號
   * @param {string} version 版本號
   */
  getVersion() {
    return this.version;
  }

  /**
   * 獲取格式化的版本字串
   * @returns {string} 格式化的版本字串
   */
  getFormattedVersion() {
    // const buildIdDisplay =
    //   this.buildId && this.buildId !== 'development'
    //     ? this.buildId.substring(0, 7)
    //     : 'dev';
    return `v${this.version}`;
  }
}

// 創建單例實例
const versionService = new VersionService();
export { versionService };
