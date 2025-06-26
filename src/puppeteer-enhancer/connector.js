const fs = require('fs');
const path = require('path');
const { connect } = require("puppeteer-real-browser");
const { puppeteer: logPuppeteer } = require('../utils/logger'); // 修复路径并重命名避免冲突
const Config = require('../utils/config'); // 修复路径

class PuppeteerConnector {
    static async connectToBitBrowser(debugInfo) {
        try {
            logPuppeteer('Connecting to Bit Browser via Puppeteer-Real-Browser');
            
            // 确保profiles目录存在
            const profilesDir = path.join(__dirname, '../../../profiles');
            if (!fs.existsSync(profilesDir)) {
                fs.mkdirSync(profilesDir, { recursive: true });
                logPuppeteer(`Created profiles directory: ${profilesDir}`);
            }
            
            // 创建唯一的用户数据目录
            const userDataDir = path.join(profilesDir, `profile-${Date.now()}`);
            fs.mkdirSync(userDataDir, { recursive: true });
            logPuppeteer(`Created user data directory: ${userDataDir}`);
            
            const { page, browser } = await connect({
                headless: Config.isHeadless(),
                turnstile: Config.getTurnstileSetting(),
                ignoreAllFlags: true,
                connectOption: {
                    browserURL: `http://${debugInfo.http}`,
                    defaultViewport: null
                },
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                    '--disable-logging' // 禁用日志减少文件创建
                ],
                customConfig: {
                    ignoreHTTPSErrors: true,
                    userDataDir: userDataDir
                }
            });
            
            // 移除navigator.webdriver属性
            await page.evaluateOnNewDocument(() => {
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
            });
            
            logPuppeteer('Successfully connected to Bit Browser');
            return { page, browser };
        } catch (error) {
            logPuppeteer(`Connection failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = PuppeteerConnector;