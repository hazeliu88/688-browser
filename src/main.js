const { browser: logBrowser, puppeteer: logPuppeteer, debug, error } = require('./utils/logger');
const BitBrowserManager = require('./bit-browser/manager');
const BrowserConnector = require('./puppeteer-enhancer/browser-connector');
const BehaviorSimulator = require('./puppeteer-enhancer/behavior-simulator');

class EnhancedBrowser {
    constructor() {
        this.bitManager = new BitBrowserManager();
        this.browserId = null;
        this.debugInfo = null;
        this.browser = null;
        this.page = null;
        this.behavior = null;
        this.isLaunched = false;
    }

    async launch() {
        if (this.isLaunched) return this;
        
        try {
            debug('Launching enhanced browser');
            
            // 创建比特浏览器实例
            const fingerprint = require('./bit-browser/fingerprint').generateRandom();
            this.browserId = await this.bitManager.createBrowser(fingerprint);
            logBrowser(`Created Bit browser: ${this.browserId}`);
            
            // 打开浏览器
            this.debugInfo = await this.bitManager.openBrowser(this.browserId);
            logBrowser(`Opened browser at ${this.debugInfo.http}`);
            
            // 连接浏览器
            const { browser: pptrBrowser, page } = await BrowserConnector.connectToBitBrowser(this.debugInfo);
            this.browser = pptrBrowser;
            this.page = page;
            
            // 初始化行为模拟器
            this.behavior = new BehaviorSimulator(page);
            
            this.isLaunched = true;
            debug('Browser launched successfully');
            return this;
        } catch (err) {
            error(`Browser launch failed: ${err.message}`);
            await this.cleanup();
            throw err;
        }
    }

    async navigate(url) {
        if (!this.isLaunched) {
            await this.launch();
        }
        
        logPuppeteer(`Navigating to ${url}`);
        try {
            await this.page.goto(url, { 
                waitUntil: 'domcontentloaded',
                timeout: 60000 
            });
            
            // 等待页面完全加载
            await this.page.evaluate(() => {
                return new Promise(resolve => {
                    if (document.readyState === 'complete') resolve();
                    document.addEventListener('readystatechange', () => {
                        if (document.readyState === 'complete') resolve();
                    });
                });
            });
            
            return this.page;
        } catch (err) {
            error(`Navigation failed: ${err.message}`);
            throw err;
        }
    }

    async cleanup() {
        if (!this.isLaunched) return;
        
        debug('Cleaning up resources');
        try {
            if (this.browser) {
                await this.browser.close(); // 使用 close() 而不是 disconnect()
                logPuppeteer('Puppeteer browser closed');
                this.browser = null;
            }
            
            if (this.browserId) {
                try {
                    await this.bitManager.closeBrowser(this.browserId);
                    logBrowser(`Closed Bit browser: ${this.browserId}`);
                } catch (err) {
                    logBrowser(`Close browser failed: ${err.message}`);
                }
                
                try {
                    await this.bitManager.deleteBrowser(this.browserId);
                    logBrowser(`Deleted Bit browser: ${this.browserId}`);
                } catch (err) {
                    logBrowser(`Delete browser failed: ${err.message}`);
                }
                
                this.browserId = null;
            }
            
            this.isLaunched = false;
            debug('Cleanup completed');
        } catch (err) {
            error(`Cleanup failed: ${err.message}`);
        }
    }
}

// // 示例用法
// (async () => {
//     try {
//         const enhancedBrowser = new EnhancedBrowser();
//         await enhancedBrowser.launch();
        
//         // 导航到检测网站
//         const page = await enhancedBrowser.navigate('https://bot.sannysoft.com');
        
//         // 等待15秒以便查看页面
//         await new Promise(resolve => setTimeout(resolve, 15000));
        
//         // 截图保存
//         await page.screenshot({ path: 'detection-test.png' });
        
//         // 导航到 Cloudflare 防护网站
//         await enhancedBrowser.navigate('https://nowsecure.nl');
        
//         // 关闭浏览器
//         await enhancedBrowser.cleanup();
//     } catch (err) {
//         console.error('Error:', err);
//     }
// })();

module.exports = EnhancedBrowser;