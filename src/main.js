const { browser, puppeteer, debug, error } = require('./utils/logger');
const BitBrowserManager = require('./bit-browser/manager');
const FingerprintGenerator = require('./bit-browser/fingerprint');
const PuppeteerConnector = require('./puppeteer-enhancer/connector');
const BehaviorSimulator = require('./puppeteer-enhancer/behavior-simulator');
const AntiDetect = require('./puppeteer-enhancer/anti-detect');
const Config = require('./utils/config');

class EnhancedBrowserManager {
    constructor() {
        this.bitManager = new BitBrowserManager();
        this.browserId = null;
        this.debugInfo = null;
        this.page = null;
        this.browser = null;
        this.behavior = null;
    }

    async launch() {
        try {
            debug('Starting browser launch sequence');
            
            // 1. 生成随机指纹
            const fingerprint = FingerprintGenerator.generateRandom();
            browser(`Generated fingerprint: ${JSON.stringify(fingerprint)}`);
            
            // 2. 创建比特浏览器实例
            this.browserId = await this.bitManager.createBrowser(fingerprint);
            browser(`Browser created with ID: ${this.browserId}`);
            
            // 3. 打开比特浏览器
            this.debugInfo = await this.bitManager.openBrowser(this.browserId);
            browser(`Browser opened at: http://${this.debugInfo.http}`);
            
            // 4. 连接Puppeteer-Real-Browser
            const { page, browser: puppeteerBrowser } = await PuppeteerConnector.connectToBitBrowser(this.debugInfo);
            this.page = page;
            this.browser = puppeteerBrowser;
            
            // 5. 应用反检测措施
            await AntiDetect.applyAntiDetect(this.page);
            
            // 6. 初始化行为模拟器
            this.behavior = new BehaviorSimulator(this.page);
            
            debug('Browser launch sequence completed');
            return this;
        } catch (err) {
            error(`Browser launch failed: ${err.message}`);
            await this.cleanup();
            throw err;
        }
    }

    async navigateTo(url) {
        puppeteer(`Navigating to: ${url}`);
        try {
            await this.page.goto(url, { 
                waitUntil: 'networkidle2',
                timeout: Config.getBrowserTimeout() 
            });
            return this.page;
        } catch (err) {
            error(`Navigation failed: ${err.message}`);
            throw err;
        }
    }

    async cleanup() {
        debug('Starting cleanup process');
        try {
            if (this.browser) {
                puppeteer('Closing Puppeteer browser');
                await this.browser.close();
            }
            
            if (this.browserId) {
                browser('Closing Bit Browser instance');
                await this.bitManager.closeBrowser(this.browserId);
                
                browser('Deleting Bit Browser instance');
                await this.bitManager.deleteBrowser(this.browserId);
            }
            
            debug('Cleanup completed');
        } catch (err) {
            error(`Cleanup failed: ${err.message}`);
        }
    }
}

module.exports = EnhancedBrowserManager;