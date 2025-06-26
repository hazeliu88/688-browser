const { puppeteer } = require('../utils/logger');

class AntiDetect {
    static async applyAntiDetect(page) {
        try {
            puppeteer('Applying anti-detection measures');
            
            // 覆盖常见的自动化检测指标
            await page.evaluateOnNewDocument(() => {
                // 覆盖webdriver属性
                Object.defineProperty(navigator, 'webdriver', {
                    get: () => false,
                });
                
                // 覆盖plugins属性
                Object.defineProperty(navigator, 'plugins', {
                    get: () => [1, 2, 3],
                });
                
                // 覆盖languages属性
                Object.defineProperty(navigator, 'languages', {
                    get: () => ['en-US', 'en'],
                });
                
                // 覆盖chrome属性
                const originalChrome = window.chrome;
                Object.defineProperty(window, 'chrome', {
                    get: () => ({
                        ...originalChrome,
                        runtime: {},
                    }),
                });
                
                // 覆盖permissions属性
                const originalPermissions = navigator.permissions;
                Object.defineProperty(navigator, 'permissions', {
                    get: () => ({
                        ...originalPermissions,
                        query: () => Promise.resolve({ state: 'denied' }),
                    }),
                });
            });
            
            // 设置用户代理重写
            const userAgent = await page.evaluate(() => navigator.userAgent);
            await page.setUserAgent(userAgent.replace(/HeadlessChrome\//, 'Chrome/'));
            
            puppeteer('Anti-detection measures applied successfully');
        } catch (error) {
            puppeteer(`Anti-detection failed: ${error.message}`);
            throw error;
        }
    }
}

module.exports = AntiDetect;