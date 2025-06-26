const { expect } = require('chai');
const EnhancedBrowserManager = require('../src/main');
const { browser, puppeteer } = require('../src/utils/logger');

describe('Bit Browser and Puppeteer Integration', function() {
    this.timeout(300000); // 5分钟超时
    
    let browserManager;
    
    before(async () => {
        browserManager = new EnhancedBrowserManager();
        await browserManager.launch();
    });
    
    after(async () => {
        await browserManager.cleanup();
    });
    
    it('should bypass Cloudflare protection', async () => {
        puppeteer('Testing Cloudflare bypass');
        const page = await browserManager.navigateTo('https://nowsecure.nl');
        
        // 检查是否通过Cloudflare验证
        const content = await page.content();
        expect(content).to.not.contain('Checking if the site connection is secure');
        expect(content).to.not.contain('Cloudflare');
    });
    
    it('should simulate human behavior', async () => {
        puppeteer('Testing human behavior simulation');
        const page = await browserManager.navigateTo('https://example.com');
        
        // 模拟点击
        await browserManager.behavior.simulateHumanClick('a', {
            moveDelay: 500,
            clickDelay: 200
        });
        
        // 模拟输入
        await browserManager.behavior.simulateHumanType('input[type="text"]', 'Human-like typing', {
            delay: 120
        });
        
        // 模拟滚动
        await browserManager.behavior.simulateHumanScroll();
    });
    
    it('should bypass bot detection', async () => {
        puppeteer('Testing bot detection bypass');
        const page = await browserManager.navigateTo('https://bot.sannysoft.com');
        
        // 获取检测结果
        const results = await page.evaluate(() => {
            const tests = Array.from(document.querySelectorAll('table tr'));
            return tests.reduce((acc, row) => {
                const testName = row.querySelector('th').textContent.trim();
                const result = row.querySelector('td').textContent.trim();
                acc[testName] = result;
                return acc;
            }, {});
        });
        
        // 验证关键检测点
        expect(results['Webdriver']).to.equal('absent (passed)');
        expect(results['Chrome']).to.equal('present (passed)');
        expect(results['Permissions API']).to.equal('present (passed)');
    });
});