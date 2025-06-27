const { expect } = require('chai');
const { puppeteer: logPuppeteer } = require('../src/utils/logger');
const EnhancedBrowser = require('../src/main');

// 共享浏览器实例状态
let browserInstance = null;
let isBrowserLaunched = false;

describe('Bit Browser Integration', function() {
    this.timeout(600000); // 10分钟超时

    before(async function() {
        if (!browserInstance) {
            browserInstance = new EnhancedBrowser();
        }
        
        if (!isBrowserLaunched) {
            await browserInstance.launch();
            isBrowserLaunched = true;
        }
    });

    after(async function() {
        if (isBrowserLaunched) {
            // 等待15秒以便查看页面
            await new Promise(resolve => setTimeout(resolve, 15000));
            await browserInstance.cleanup();
            isBrowserLaunched = false;
        }
    });

    it('should bypass bot detection', async function() {
        logPuppeteer('Testing bot detection bypass');
        const page = await browserInstance.navigate('https://bot.sannysoft.com');
        
        // 等待检测页面完全加载
        await page.waitForFunction(() => {
            // 检查测试表格是否存在
            const table = document.querySelector('table');
            return table && table.rows.length > 10;
        }, { timeout: 30000 });
        
        // 获取检测结果
        const results = await page.evaluate(() => {
            const table = document.querySelector('table');
            const results = {};
            
            if (table) {
                for (let i = 0; i < table.rows.length; i++) {
                    const row = table.rows[i];
                    if (row.cells.length >= 2) {
                        const testName = row.cells[0].textContent.trim();
                        const result = row.cells[1].textContent.trim();
                        results[testName] = result;
                    }
                }
            }
            
            return results;
        });
        
        // 打印所有结果用于调试
        console.log('Bot detection results:', JSON.stringify(results, null, 2));
        
        // 检查关键指标
        expect(results['WebDriver (New)']).to.equal('absent (passed)');
        expect(results['Plugins is of type PluginArray']).to.equal('present (passed)');
        expect(results['Chrome (New)']).to.equal('present (passed)');
    });

    it('should bypass Cloudflare protection', async function() {
        logPuppeteer('Testing Cloudflare bypass');
        const page = await browserInstance.navigate('https://nowsecure.nl');
        
        // 等待页面完全加载
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
        
        // 检查是否通过Cloudflare验证
        const content = await page.content();
        expect(content).to.not.contain('Checking if the site connection is secure');
        expect(content).to.not.contain('Cloudflare');
    });

    it('should simulate human-like behavior', async function() {
        logPuppeteer('Testing human-like behavior simulation');
        
        // 导航到示例页面
        const page = await browserInstance.navigate('https://example.com');
        await page.waitForFunction(() => document.readyState === 'complete', { timeout: 30000 });
        
        // 模拟鼠标移动
        await browserInstance.behavior.simulateMouseMovement('body');
        
        // 模拟点击
        await browserInstance.behavior.simulateHumanClick('a');
        
        // 模拟滚动
        await browserInstance.behavior.simulateScroll();
    });
});