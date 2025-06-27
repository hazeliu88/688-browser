const GhostCursorManager = require('./ghost-cursor');
const { puppeteer } = require('../utils/logger');

class BehaviorSimulator {
    constructor(page) {
        this.page = page;
        this.cursorManager = new GhostCursorManager(page);
    }

    async simulateHumanClick(selector, options = {}) {
        puppeteer(`Simulating human click on ${selector}`);
        try {
            await this.cursorManager.clickCursor(selector, options);
        } catch (err) {
            puppeteer(`Click simulation failed: ${err.message}`);
            throw err;
        }
    }

    async simulateMouseMovement(selector, options = {}) {
        puppeteer(`Simulating mouse movement to ${selector}`);
        try {
            await this.cursorManager.moveCursor(selector, options);
        } catch (err) {
            puppeteer(`Mouse movement simulation failed: ${err.message}`);
            throw err;
        }
    }

    async simulateHumanType(selector, text, options = {}) {
        puppeteer(`Simulating human typing in ${selector}`);
        try {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            await this.page.focus(selector);
            
            // 模拟人类输入速度
            for (const char of text) {
                await this.page.keyboard.type(char, { delay: options.delay || 100 });
                // 使用 Promise 替代 waitForTimeout
                await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
            }
        } catch (err) {
            puppeteer(`Typing simulation failed: ${err.message}`);
            throw err;
        }
    }

    async simulateScroll(options = {}) {
        puppeteer('Simulating human scrolling');
        try {
            // 确保文档完全加载
            await this.page.waitForFunction(() => document.readyState === 'complete');
            
            // 获取滚动高度
            const scrollHeight = await this.page.evaluate(() => {
                return document.documentElement.scrollHeight || document.body.scrollHeight;
            });
            
            const scrollAmount = Math.floor(Math.random() * scrollHeight);
            
            await this.page.evaluate((amount) => {
                window.scrollTo({
                    top: amount,
                    behavior: 'smooth'
                });
            }, scrollAmount);
            
            // 使用 Promise 替代 waitForTimeout
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        } catch (err) {
            puppeteer(`Scroll simulation failed: ${err.message}`);
        }
    }
}

module.exports = BehaviorSimulator;