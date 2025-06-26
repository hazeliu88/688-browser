const { puppeteer } = require('../utils/logger');

class BehaviorSimulator {
    constructor(page) {
        this.page = page;
    }

    async simulateHumanClick(selector, options = {}) {
        puppeteer(`Simulating human click on ${selector}`);
        try {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            
            if (this.page.realClick) {
                return this.page.realClick(selector, {
                    button: options.button || 'left',
                    moveDelay: options.moveDelay || 300,
                    clickDelay: options.clickDelay || 150,
                });
            } else {
                // Fallback to normal click if realClick not available
                return this.page.click(selector, options);
            }
        } catch (error) {
            puppeteer(`Click simulation failed: ${error.message}`);
            throw error;
        }
    }

    async simulateHumanType(selector, text, options = {}) {
        puppeteer(`Simulating human typing in ${selector}`);
        try {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            
            if (this.page.realType) {
                return this.page.realType(selector, text, {
                    delay: options.delay || 80,
                });
            } else {
                // Fallback to normal typing
                await this.page.type(selector, text, { delay: options.delay || 80 });
            }
        } catch (error) {
            puppeteer(`Typing simulation failed: ${error.message}`);
            throw error;
        }
    }

    async simulateHumanScroll(selector = 'html', options = {}) {
        puppeteer('Simulating human scrolling');
        try {
            if (this.page.realScroll) {
                return this.page.realScroll({
                    behavior: options.behavior || 'smooth',
                    steps: options.steps || 10,
                    distance: options.distance || 300,
                    selector
                });
            } else {
                // Fallback to normal scrolling
                await this.page.evaluate((sel) => {
                    document.querySelector(sel).scrollBy(0, 300);
                }, selector);
            }
        } catch (error) {
            puppeteer(`Scroll simulation failed: ${error.message}`);
            throw error;
        }
    }
    async simulateMouseMovement(selector) {
        puppeteer(`Simulating mouse movement to ${selector}`);
        try {
            await this.page.waitForSelector(selector, { timeout: 10000 });
            
            if (this.page.realMove) {
                return this.page.realMove(selector, {
                    steps: 10,
                    movementVariance: 5,
                    waitForSelector: false
                });
            } else {
                // Fallback to normal movement
                const rect = await this.page.evaluate((sel) => {
                    const element = document.querySelector(sel);
                    const { top, left, width, height } = element.getBoundingClientRect();
                    return { top, left, width, height };
                }, selector);
                
                await this.page.mouse.move(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2,
                    { steps: 10 }
                );
            }
        } catch (error) {
            puppeteer(`Mouse movement simulation failed: ${error.message}`);
            throw error;
        }
    }

    async simulateRandomScroll() {
        puppeteer('Simulating random scrolling');
        try {
            const scrollHeight = await this.page.evaluate(() => {
                return document.documentElement.scrollHeight;
            });
            
            const scrollAmount = Math.floor(Math.random() * scrollHeight);
            await this.page.evaluate((amount) => {
                window.scrollTo({
                    top: amount,
                    behavior: 'smooth'
                });
            }, scrollAmount);
            
            await this.page.waitForTimeout(1000 + Math.random() * 2000);
        } catch (error) {
            puppeteer(`Random scrolling failed: ${error.message}`);
        }
    }

}

module.exports = BehaviorSimulator;