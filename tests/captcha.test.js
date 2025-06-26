const { expect } = require('chai');
const EnhancedBrowserManager = require('../src/main');
const { puppeteer } = require('../src/utils/logger');

describe('Captcha Solving Tests', function() {
    this.timeout(300000); // 5分钟超时
    
    let browserManager;
    
    before(async () => {
        browserManager = new EnhancedBrowserManager();
        await browserManager.launch();
    });
    
    after(async () => {
        await browserManager.cleanup();
    });
    
    // 测试reCAPTCHA v2
    it('should bypass reCAPTCHA v2', async () => {
        puppeteer('Testing reCAPTCHA v2 bypass');
        const page = await browserManager.navigateTo('https://patrickhlauke.github.io/recaptcha/');
        
        // 检查是否自动通过验证
        const iframe = await page.$('iframe[src*="recaptcha"]');
        expect(iframe).to.exist;
        
        // 等待可能的自动解决
        await page.waitForTimeout(5000);
        
        // 检查验证状态
        const isSolved = await page.evaluate(() => {
            return document.querySelector('#recaptcha-demo-success') !== null;
        });
        
        expect(isSolved).to.be.true;
    });
    
    // 测试hCaptcha
    it('should bypass hCaptcha', async () => {
        puppeteer('Testing hCaptcha bypass');
        const page = await browserManager.navigateTo('https://accounts.hcaptcha.com/demo');
        
        // 检查是否自动通过验证
        const iframe = await page.$('iframe[src*="hcaptcha"]');
        expect(iframe).to.exist;
        
        // 等待可能的自动解决
        await page.waitForTimeout(5000);
        
        // 尝试提交表单
        await browserManager.behavior.simulateHumanClick('button[type="submit"]');
        
        // 等待验证结果
        await page.waitForSelector('.success', { timeout: 30000 });
        const successMessage = await page.$eval('.success', el => el.textContent);
        expect(successMessage).to.contain('Verification Success');
    });
    
    // 测试Cloudflare Turnstile
    it('should bypass Cloudflare Turnstile', async () => {
        puppeteer('Testing Cloudflare Turnstile bypass');
        const page = await browserManager.navigateTo('https://demo.cloudflare.com/turnstile/');
        
        // 检查是否存在Turnstile组件
        const iframe = await page.$('iframe[src*="challenges.cloudflare"]');
        expect(iframe).to.exist;
        
        // 等待可能的自动解决
        await page.waitForTimeout(5000);
        
        // 检查验证状态
        const isVerified = await page.evaluate(() => {
            return document.querySelector('.indicator.verified') !== null;
        });
        
        expect(isVerified).to.be.true;
    });
    
    // 测试FunCaptcha
    it('should bypass FunCaptcha', async () => {
        puppeteer('Testing FunCaptcha bypass');
        const page = await browserManager.navigateTo('https://www.funcaptcha.com/demo/');
        
        // 检查是否存在FunCaptcha组件
        const captchaContainer = await page.$('#funcaptcha-demo');
        expect(captchaContainer).to.exist;
        
        // 等待可能的自动解决
        await page.waitForTimeout(10000);
        
        // 尝试提交表单
        await browserManager.behavior.simulateHumanClick('#verify-button');
        
        // 等待验证结果
        await page.waitForSelector('.success', { timeout: 30000 });
        const successMessage = await page.$eval('.success', el => el.textContent);
        expect(successMessage).to.contain('Verification Success');
    });
    
    // 测试文本验证码
    it('should bypass simple text captchas', async () => {
        puppeteer('Testing simple text captcha bypass');
        const page = await browserManager.navigateTo('https://captchatest.online/image');
        
        // 获取验证码图片
        const captchaImage = await page.$('#captchaimage');
        expect(captchaImage).to.exist;
        
        // 这里应该添加OCR识别逻辑（实际项目中需要集成OCR服务）
        // 由于测试目的，我们假设验证码是"12345"
        const captchaSolution = '12345';
        
        // 输入验证码
        await browserManager.behavior.simulateHumanType('#captcha', captchaSolution);
        
        // 提交表单
        await browserManager.behavior.simulateHumanClick('input[type="submit"]');
        
        // 检查结果
        await page.waitForSelector('.success', { timeout: 30000 });
        const successMessage = await page.$eval('.success', el => el.textContent);
        expect(successMessage).to.contain('CAPTCHA verification passed');
    });
});